angular.module('mwUI.Layout')

  .directive('mwHeader', function ($rootScope, $route, $location, BrowserTitleHandler) {
    return {
      transclude: true,
      scope: {
        title: '@',
        url: '@?',
        mwTitleIcon: '@?',
        showBackButton: '=?',
        mwBreadCrumbs: '=?'
      },
      require: '^?mwUi',
      templateUrl: 'uikit/mw-layout/directives/templates/mw_header.html',
      link: function (scope, el, attrs, mwUiCtrl, $transclude) {
        $rootScope.siteTitleDetails = scope.title;
        BrowserTitleHandler.setTitle(scope.title);

        $transclude(function (clone) {
          if ((!clone || clone.length === 0) && !scope.showBackButton) {
            el.find('.mw-header').addClass('no-buttons');
          }
        });

        scope.refresh = function () {
          $route.reload();
        };

        scope.back = function () {
          var path = scope.url.replace('#', '');
          $location.path(path);
        };

        scope.canShowBackButton = function(){
          return (angular.isUndefined(scope.showBackButton) || scope.showBackButton) && angular.isDefined(scope.url);
        };

        if (!scope.url && scope.mwBreadCrumbs && scope.mwBreadCrumbs.length > 0) {
          scope.url = scope.mwBreadCrumbs[scope.mwBreadCrumbs.length - 1].url;
        } else if (!scope.url && scope.showBackButton) {
          throw new Error('[mwHeader] Can not show back button when the attribute url is not defined');
        }

        if(mwUiCtrl){
          mwUiCtrl.addClass('has-mw-header');
          scope.$on('$destroy', function(){
            mwUiCtrl.removeClass('has-mw-header');
          });
        }
      }
    };
  });