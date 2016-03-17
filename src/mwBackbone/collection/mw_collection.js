mwUI.Backbone.Collection = Backbone.Collection.extend({
  selectable: true,
  filterable: true,
  basePath: '',
  endpoint: null,
  selectableOptions: mwUI.Backbone.SelectableCollection.prototype.selectableOptions,
  filterableOptions: mwUI.Backbone.FilterableCollection.prototype.filterableOptions,
  model: mwUI.Backbone.Model,
  url: function () {
    var basePath = _.result(this, 'basePath'),
      endpoint = _.result(this, 'endpoint');

    if (endpoint) {
      return window.mwUI.Backbone.concatUrlParts(mwUI.Backbone.baseUrl, basePath, endpoint);
    } else {
      throw new Error('An endpoint has to be specified');
    }
  },
  getEndpoint: function () {
    return this.url();
  },
  setEndpoint: function (endpoint) {
    this.endpoint = endpoint;
  },
  replace: function (models) {
    this.reset(models);
    this.trigger('replace', this);
  },
  constructor: function () {
    var superConstructor = Backbone.Collection.prototype.constructor.apply(this, arguments);
    mwUI.Backbone.SelectableCollection.prototype.selectableCollectionConstructor.apply(this, arguments);
    mwUI.Backbone.FilterableCollection.prototype.filterableCollectionConstructor.apply(this, arguments);
    return superConstructor;
  },
  fetch: function () {
    return mwUI.Backbone.FilterableCollection.prototype.fetch.apply(this, arguments);
  }
});