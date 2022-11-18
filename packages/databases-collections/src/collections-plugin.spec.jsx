import React from 'react';
import { mount } from 'enzyme';
import { Provider } from 'react-redux';
import { expect } from 'chai';
import CollectionsPlugin from './collections-plugin';

describe('Collections [Plugin]', function () {
  let component;

  beforeEach(function (done) {
    component = mount(<CollectionsPlugin />);
    done();
  });

  afterEach(function (done) {
    component = null;
    done();
  });

  it('should contain a <Provider /> with a store prop', function () {
    expect(component.find(Provider).first().props('store')).to.be.an('object');
  });
});
