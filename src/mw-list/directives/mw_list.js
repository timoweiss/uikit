angular.module('mwUI.List')

//Todo rename to mwList
  .directive('mwListableBb', function () {
    return {
      //TODO rename collection to mwCollection
      //Move sort and filter persistance into filterable and remove mwListCollection
      scope: {
        collection: '=',
        mwListCollection: '=',
        enableConfigurator: '=?',
        id: '@'
      },
      compile: function (elm) {
        elm.append('<tfoot mw-listable-footer-bb></tfoot>');

        return function (scope, elm) {
          elm.addClass('hide-all-cols');
          elm.addClass('table table-striped mw-list');
        };
      },
      controller: function ($scope, TableConfigurator) {
        var _columns = $scope.columns = [],
          _collection = null,
          _mwListCollectionFilter = null,
          _tableConfigurator;
        this.enableConfigurator = $scope.enableConfigurator;
        this.actionColumns = [];
        this.maxActionColumnsAmount = 0;

        var notifyColumns = function (event, affectedCol) {
          $scope.$emit(event, affectedCol);
          _columns.forEach(function (column) {
            column.scope.$broadcast(event, affectedCol);
          });
        };

        this.registerColumn = function (column) {
          _columns.push(column);
          notifyColumns('mwList:registerColumn');
        };

        this.updateColumn = function (column) {
          if (column && column.id) {
            var scopeInArray = _.findWhere(_columns, {id: column.id}),
              indexOfScope = _.indexOf(_columns, scopeInArray);

            if (indexOfScope > -1) {
              var existingColumn = _columns[indexOfScope];
              _.extend(existingColumn, column);
              notifyColumns('mwList:updateColumn', existingColumn);
            }
          }
        };

        this.unRegisterColumn = function (column) {
          if (column && column.id) {
            var scopeInArray = _.findWhere(_columns, {id: column.id}),
              indexOfScope = _.indexOf(_columns, scopeInArray);

            if (indexOfScope > -1) {
              _columns.splice(indexOfScope, 1);
              notifyColumns('mwList:unRegisterColumn', _columns[indexOfScope]);
            }
          }
        };

        this.getColumns = function () {
          return _columns;
        };

        this.getId = function(){
          return $scope.id;
        };

        this.getCollection = function () {
          return _collection;
        };

        this.getTableConfigurator = function(){
          if(!_tableConfigurator){
            if($scope.id){
              _tableConfigurator = TableConfigurator.getInstanceForTableId($scope.id);
            } else {
              return false;
            }
          }
          _tableConfigurator.fetch();
          return _tableConfigurator;
        };

        this.isSingleSelection = function () {
          if (_collection && _collection.selectable) {
            return _collection.selectable.isSingleSelection();
          }
          return false;
        };

        $scope.$on('$destroy', function () {
          this.actionColumns = [];
        }.bind(this));

        if ($scope.mwListCollection) {
          _collection = $scope.mwListCollection.getCollection();
          _mwListCollectionFilter = $scope.mwListCollection.getMwListCollectionFilter();
        } else if ($scope.collection) {
          _collection = $scope.collection;
        }
      }
    };
  })

  .directive('mwListableBb', function () {
    return {
      require: 'mwListableBb',
      link: function (scope, el, attr, mwListCtrl) {
        var removeAllColsHideClass = function(){
          el.removeClass('hide-all-cols');
        };

        var throttledRemoveAllColsHideClass = _.debounce(removeAllColsHideClass, 200);

        var makeAllColumnsVisible = function () {
          el.removeClass(function (index, className) {
            return (className.match(/(^|\s)(hidden-col-|visible-col-)\S+/g) || []).join(' ');
          });
        };

        var manageColumVisibility = function () {
          makeAllColumnsVisible();
          mwListCtrl.getColumns().forEach(function (column) {
            if (!column.scope.isVisible()) {
              el.addClass('hidden-col-' + column.pos);
            } else {
              el.addClass('visible-col-' + column.pos);
            }
          });
          throttledRemoveAllColsHideClass();
        };

        var throttledHandler = _.debounce(manageColumVisibility, 200);

        scope.$on('mwList:registerColumn', throttledHandler);
        scope.$on('mwList:unRegisterColumn', throttledHandler);
        scope.$on('mwList:updateColumn', throttledHandler);
      }
    };
  });