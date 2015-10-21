var View = require('ampersand-view');
var SidebarView = require('./sidebar');
var ConnectionCollection = require('../models/connection-collection');
var ConnectFormView = require('./connect-form-view');
var debug = require('debug')('scout:connect:index');

/**
 * AuthenticationOptionCollection
 */
var authMethods = require('./authentication');

/**
 * SslOptionCollection
 */
var sslMethods = require('./ssl');


var ConnectView = View.extend({
  template: require('./static-connect.jade'),
  props: {
    form: 'object',
    isReady: 'boolean',
    authMethod: {
      type: 'string',
      default: 'MONGODB'
    },
    previousAuthMethod: {
      type: 'string',
      default: null
    },
    sslMethod: {
      type: 'string',
      default: 'NONE'
    },
    previousSslMethod: {
      type: 'string',
      default: null
    }
  },
  collections: {
    connections: ConnectionCollection
  },
  events: {
    'change select[name=authentication]': 'onAuthMethodChanged',
    'change select[name=ssl]': 'onSslMethodChanged'
  },
  subviews: {
    sidebar: {
      hook: 'sidebar-subview',
      waitFor: 'connections',
      prepareView: function(el) {
        return new SidebarView({
          el: el,
          parent: this,
          collection: this.connections
        });
      }
    }
  },
  initialize: function() {
    this.connections.fetch();
  },
  render: function() {
    this.renderWithTemplate({
      authMethods: authMethods.serialize(),
      sslMethods: sslMethods.serialize()
    });

    this.form = new ConnectFormView({
      parent: this,
      el: this.queryByHook('connect-form'),
      autoRender: true,
      autoAppend: false
    });

    this.registerSubview(this.form);
  },
  onAuthMethodChanged: function(evt) {
    this.authMethod = evt.target.value;
    debug('auth method was changed from', this.previousAuthMethod, 'to', this.authMethod);

    // remove and unregister old fields
    var oldFields = _.get(authMethods.get(this.previousAuthMethod), 'fields', []);
    _.each(oldFields, function(field) {
      this.form.removeField(field.name);
    }.bind(this));

    // register new with form, render, append to DOM
    var newFields = authMethods.get(this.authMethod).fields;
    _.each(newFields, function(field) {
      this.form.addField(field.render());
      this.query('#auth-' + this.authMethod).appendChild(field.el);
    }.bind(this));

    this.previousAuthMethod = this.authMethod;
    debug('auth form data now has the following fields', Object.keys(this.form.data));
  },
  onSslMethodChanged: function(evt) {
    this.sslMethod = evt.target.value;
    debug('ssl method was changed from', this.previousSslMethod, 'to', this.sslMethod);

    // remove and unregister old fields
    var oldFields = _.get(sslMethods.get(this.previousSslMethod), 'fields', []);
    debug('old SSL fields', oldFields);
    _.each(oldFields, function(field) {
      this.form.removeField(field.name);
    }.bind(this));

    // register new with form, render, append to DOM
    var newFields = sslMethods.get(this.sslMethod).fields;
    debug('new SSL fields', newFields);
    _.each(newFields, function(field) {
      this.form.addField(field.render());
      this.query('#ssl-' + this.sslMethod).appendChild(field.el);
    }.bind(this));

    this.previousSslMethod = this.sslMethod;
    debug('ssl form data now has the following fields', Object.keys(this.form.data));
  },
  /**
   * Return to a clean state between form submissions.
   *
   * @api private
   */
  reset: function() {
    this.message = '';
    this.has_error = false;
  },
  /**
   * Use a connection to view schemas, such as after submitting a form or when double-clicking on
   * a list item like in `./sidebar`.
   *
   * @param {Connection} connection
   * @api public
   */
  connect: function(connection) {
    app.statusbar.show();

    debug('testing credentials are usable...');
    connection.test(function(err) {
      app.statusbar.hide();
      if (!err) {
        this.onConnectionSuccessful(connection);
        return;
      }

      debug('failed to connect', err);

      this.onError(new Error('Could not connect to MongoDB.'), connection);
      return;
    }.bind(this));
  },
  /**
   * If there is a validation or connection error show a nice message.
   *
   * @param {Error} err
   * @param {Connection} connection
   * @api private
   */
  onError: function(err, connection) {
    // @todo (imlucas): `metrics.trackEvent('connect error', authentication + ssl boolean)`
    debug('showing error message', {
      err: err,
      model: connection
    });
    this.message = err.message;
    this.has_error = true;
  },
  onConnectionSuccessful: function(connection) {
    app.statusbar.hide();
    // this.form.connection_id = '';

    /**
     * The save method will handle calling the correct method
     * of the sync being used by the model, whether that's
     * `create` or `update`.
     *
     * @see http://ampersandjs.com/docs#ampersand-model-save
     */
    connection.last_used = new Date();
    // connection.save();
    /**
     * @todo (imlucas): So we can see what auth mechanisms
     * and accoutrement people are actually using IRL.
     *
     *   metrics.trackEvent('connect success', {
     *     authentication: model.authentication,
     *     ssl: model.ssl
     *   });
     */
    this.connections.add(connection, {
      merge: true
    });

    debug('opening schema view for', connection.serialize());
    window.open(format('%s?connection_id=%s#schema', window.location.origin, connection.getId()));
    setTimeout(this.set.bind(this, {
      message: ''
    }), 500);

    setTimeout(window.close, 1000);
  },
  onFormSubmitted: function(connection) {
    this.reset();
    if (!connection.isValid()) {
      this.onError(connection.validationError);
      return;
    }
    this.connect(connection);
  },
  /**
   * Update the form's state based on an existing
   * connection, e.g. clicking on a list item
   * like in `./sidebar.js`.
   *
   * @param {Connection} connection
   * @api public
   */
  onConnectionSelected: function(connection) {
    // If the new model has auth, expand the auth settings container
    // and select the correct tab.
    connection.authentication = connection.authentication || 'NONE';
    this.authMethod = connection.authentication;

    if (connection.authentication !== 'NONE') {
      this.authOpen = true;
    } else {
      this.authOpen = false;
    }

    // Changing `this.authMethod` dynamically updates the
    // fields in the form because it's a top-level constraint
    // so we need to get a list of what keys are currently
    // available to set.
    var keys = ['name', 'port', 'hostname'];
    if (connection.authentication !== 'NONE') {
      keys.push.apply(keys, _.pluck(authentication.get(this.authMethod).fields, 'name'));
    }

    debug('Populating form fields with keys', keys);
    var values = _.pick(connection, keys);

    this.form.connection_id = connection.getId();

    // Populates the form from values in the model.
    this.form.setValues(values);
  }
});

module.exports = ConnectView;
