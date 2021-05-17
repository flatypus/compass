import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import numeral from 'numeral';
import assign from 'lodash.assign';
import isNaN from 'lodash.isnan';
import classnames from 'classnames';
import { SortableTable } from 'hadron-react-components';
import dropCollectionStore from 'stores/drop-collection';

import styles from './collections-table.less';
import { PROPERTIES_CAPPED, PROPERTIES_COLLATION, PROPERTIES_TIME_SERIES, PROPERTIES_VIEW } from '../../modules/collections';
import PropertyBadge from './property-badge';

/**
 * The name constant.
 */
const NAME = 'Collection Name';

/**
 * Doc constant.
 */
const DOCUMENTS = 'Documents';

/**
 * Avg doc size constant.
 */
const AVG_DOC_SIZE = 'Avg. Document Size';

/**
 * Total doc size constant.
 */
const TOT_DOC_SIZE = 'Total Document Size';

/**
 * Num indexes constant.
 */
const NUM_INDEX = 'Num. Indexes';

/**
 * Total index size constant.
 */
const TOT_INDEX_SIZE = 'Total Index Size';

/**
 * Properties constant.
 */
const PROPS = 'Properties';

/**
 * Dash constant.
 */
const DASH = '-';

/**
 * The help URL for collation.
 */
const HELP_URL_COLLATION = 'https://docs.mongodb.com/master/reference/collation/';

/**
 * Collation option mappings.
 */
const PROPERTY_OPTIONS = {
  locale: 'Locale',
  caseLevel: 'Case Level',
  caseFirst: 'Case First',
  strength: 'Strength',
  numericOrdering: 'Numeric Ordering',
  alternate: 'Alternate',
  maxVariable: 'MaxVariable',
  normalization: 'Normalization',
  backwards: 'Backwards',
  version: 'Version'
};

/**
 * The collections table component.
 */
class CollectionsTable extends PureComponent {
  static displayName = 'CollectionsTableComponent';

  static propTypes = {
    columns: PropTypes.array.isRequired,
    collections: PropTypes.array.isRequired,
    isWritable: PropTypes.bool.isRequired,
    isReadonly: PropTypes.bool.isRequired,
    openLink: PropTypes.func.isRequired,
    open: PropTypes.func.isRequired,
    databaseName: PropTypes.string,
    sortOrder: PropTypes.string.isRequired,
    sortColumn: PropTypes.string.isRequired,
    sortCollections: PropTypes.func.isRequired,
    showCollection: PropTypes.func.isRequired
  }

  /**
   * Executed when a column header is clicked.
   *
   * @param {String} column - The column.
   * @param {String} order - The order.
   */
  onHeaderClicked = (column, order) => {
    this.props.sortCollections(this.props.collections, column, order);
  }

  /**
   * Happens on the click of the delete trash can in the list.
   *
   * @param {Number} index - The index in the list.
   * @param {String} name - The collection name.
   */
  onDeleteClicked = (index, name) => {
    dropCollectionStore.dispatch(this.props.open(name, this.props.databaseName));
  }

  /**
   * Use clicked on the db name link.
   *
   * @param {String} name - The db name.
   */
  onNameClicked(name) {
    this.props.showCollection(name);
  }

  /**
   * Render the collation properties.
   *
   * @param {Object} properties - The properties.
   *
   * @returns {Object} The mapped properties.
   */
  renderOptions(options) {
    const knownOptions = Object.keys(options)
      .filter((key) => PROPERTY_OPTIONS[key]);

    if (!knownOptions.length) {
      return;
    }

    let text = '';
    knownOptions.forEach((key) => {
      if (text !== '') {
        text = `${text}<br />`;
      }
      text = `${text}${PROPERTY_OPTIONS[key]}: ${options[key]}`;
    });
    return text;
  }

  /**
   * Render the collection link.
   *
   * @param {Object} coll - The collection object.
   *
   * @returns {Component} The component.
   */
  renderLink(coll) {
    const collName = coll[NAME];
    let viewInfo = null;

    if (coll.type === 'view' && coll.view_on) {
      viewInfo = <span className={styles['collections-table-view-on']}>(view on: {coll.view_on})</span>;
    }

    return (
      <div>
        <a
          className={classnames(styles['collections-table-link'])}
          onClick={this.onNameClicked.bind(this, collName)}>
          {collName}
        </a>
        {viewInfo}
      </div>
    );
  }

  renderProperty = (key, property) => {
    const { name, options } = property || {};

    if (name === PROPERTIES_COLLATION) {
      return (<PropertyBadge
        key={key}
        label="Collation"
        tooltip={this.renderOptions(options)}
      />);
    }

    if (name === PROPERTIES_VIEW) {
      return (<PropertyBadge
        key={key}
        label="View"
        tooltip={this.renderOptions(options)} />);
    }

    if (name === PROPERTIES_CAPPED) {
      return (<PropertyBadge
        key={key}
        label="Capped"
        tooltip={this.renderOptions(options)} />);
    }

    if (name === PROPERTIES_TIME_SERIES) {
      return (<PropertyBadge
        key={key}
        label="Time-Series"
        tooltip={this.renderOptions(options)} />);
    }
  }

  renderProperties = (coll) => {
    return (coll.Properties || []).map((property, i) => {
      return this.renderProperty(`${coll._id}-prop-${i}`, property);
    });
  }

  /**
   * Render Collections Table component.
   *
   * @returns {React.Component} The rendered component.
   */
  render() {
    const rows = this.props.collections.map((coll) => {
      const linkName = this.renderLink(coll);
      return assign({}, coll, {
        [NAME]: linkName,
        [DOCUMENTS]: isNaN(coll.Documents) ? DASH : numeral(coll.Documents).format('0,0'),
        [AVG_DOC_SIZE]: isNaN(coll[AVG_DOC_SIZE]) ?
          DASH : numeral(coll[AVG_DOC_SIZE]).format('0.0 b'),
        [TOT_DOC_SIZE]: isNaN(coll[TOT_DOC_SIZE]) ?
          DASH : numeral(coll[TOT_DOC_SIZE]).format('0.0 b'),
        [NUM_INDEX]: isNaN(coll[NUM_INDEX]) ? DASH : coll[NUM_INDEX],
        [TOT_INDEX_SIZE]: isNaN(coll[TOT_INDEX_SIZE]) ?
          DASH : numeral(coll[TOT_INDEX_SIZE]).format('0.0 b'),
        [PROPS]: this.renderProperties(coll)
      });
    });

    return (
      <div className="column-container">
        <div className="column main">
          <SortableTable
            theme="light"
            columns={this.props.columns}
            rows={rows}
            sortable
            sortOrder={this.props.sortOrder}
            sortColumn={this.props.sortColumn}
            valueIndex={0}
            removable={this.props.isWritable}
            onColumnHeaderClicked={this.onHeaderClicked}
            onRowDeleteButtonClicked={this.onDeleteClicked} />
        </div>
      </div>
    );
  }
}

export default CollectionsTable;
