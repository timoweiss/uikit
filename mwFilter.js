'use strict';

angular.module('mwFilter', [])

/**
 * @ngdoc directive
 * @name mwFilter.directive:mwFilterSelect
 * @element div
 * @description
 *
 * Creates a select input which provides possible values for a filtering.
 *
 * @param {filterable} filterable Filterable instance.
 * @param {expression} disabled If expression evaluates to true, input is disabled.
 * @param {string} property The name of the property on which the filtering should happen.
 */
    .directive('mwFilterSelect', function () {
      return {
        transclude: true,
        scope: {
          filterable: '=',
          disabled: '=',
          property: '@'
        },
        templateUrl: 'modules/ui/templates/mwFilter/mwFilterSelect.html',
        link: function (scope) {
          scope.$watch('filterable', function() {
            if(scope.filterable) {
              scope.model = scope.filterable.properties[scope.property];
            }
          });
        }
      };
    })

/**
 * @ngdoc directive
 * @name mwFilter.directive:mwFilterSearch
 * @element div
 * @description
 *
 * Creates a search field to filter by. Search is triggered on keypress 'enter'.
 *
 * @param {filterable} filterable Filterable instance.
 * @param {expression} disabled If expression evaluates to true, input is disabled.
 * @param {string} property The name of the property on which the filtering should happen.
 */
    .directive('mwFilterSearch', function () {
      return {
        transclude: true,
        scope: {
          filterable: '=',
          disabled: '=',
          property: '@'
        },
        templateUrl: 'modules/ui/templates/mwFilter/mwFilterSearch.html',
        link: function (scope) {
          scope.model = scope.filterable.properties[scope.property];

          scope.search = function (event) {
            if (event === null || event.keyCode === 13) {
              scope.filterable.applyFilters();
            }
          };
        }
      };
    })

/**
 * @ngdoc directive
 * @name mwFilter.directive:mwFilterPanel
 * @element div
 * @description
 *
 * Directive for the filter panel.
 *
 * @param {boolean} affix Make the filterbar affix by listening on window scroll event and changing top position so that the filterbar can be postion relative instead of fixed
 * @param {number} offset If needed an offset to the top for example when a nav bar is over the sidebar that is not fixed.
 *
 */
    .directive('mwFilterPanel', function ($document) {
      return {
        replace: true,
        transclude: true,
        scope: {
          affix:'@',
          offset:'@'
        },
        templateUrl: 'modules/ui/templates/mwFilter/mwFilterPanel.html',
        link: function(scope,el,attr){

          var offsetTop = angular.element(el).offset().top;

          var repositionFilterPanel = function(){
            var scrollPos = $document.scrollTop(),
                newPos = scrollPos-offsetTop-(attr.offset*-1);
            newPos=newPos>0?newPos:0;
            if(newPos<0){
              newPos=0;
              el.removeClass('affixed');
            }
            el.addClass('affixed');
            el.css('top',newPos);
          };

          if(attr.affix){
            angular.element(window).scroll(function() {
              repositionFilterPanel();
            });
          }
        }
      };
    });
