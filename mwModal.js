'use strict';

angular.module('mwModal', [])

/**
 *
 * @ngdoc object
 * @name mwModal.Modal
 * @description The Modal service is used to manage Bootstrap modals.
 * @example
 * <doc:example>
 *   <doc:source>
 *     <script>
 *       function Controller($scope, Modal) {
 *        var modal = Modal.create({
 *          templateUrl: 'myModal.html',
 *          scope: $scope,
 *          controller: function() {
 *            // do something on initialization
 *          }
 *        });
 *        $scope.onClick = function() {
 *          Modal.show(modal)
 *        }
 *       }
 *     </script>
 *   </doc:source>
 * </doc:example>
 */
    .service('Modal', function ($rootScope, $templateCache, $document, $compile, $controller) {
      var _scope,
          _template,
          _cachedTemplate,
          _modals = {},
          _body = $document.find('body').eq(0);

      /**
       *
       * @ngdoc function
       * @name mwModal.Modal#create
       * @methodOf mwModal.Modal
       * @function
       * @description Create and initialize the modal element in the DOM. Available options
       *
       * - **templateUrl**: URL to a template (_required_)
       * - **scope**: scope that should be available in the controller
       * - **controller**: controller instance for the modal
       *
       * @param {Object} modalOptions The options of the modal which are used to instantiate it
       * @returns {String} modalId Modal identifier
       */
      this.create = function (modalOptions) {
        var _modal, _modalId, _ctrl;

        if (!modalOptions.templateUrl) {
          throw new Error('Modal service: templateUrl options is required.');
        }

        // Generate modal id from templateUrl: '/url/to/myModal.html' -> 'myModal'
        _modalId = modalOptions.templateUrl;

        if (!_modals[_modalId]) {
          // Create new scope if scope is not given in options
          _scope = (modalOptions.scope || $rootScope).$new();

          // Get template from cache
          _cachedTemplate = $templateCache.get(modalOptions.templateUrl);

          // Throw error if template with this ID/Path hasn't been found
          if (!angular.isDefined(_cachedTemplate)) {
            throw new Error('Modal service: template \'' + modalOptions.templateUrl + '\' has not been found. Does a template with this ID/Path exist?');
          }
          // Build element
          _template = angular.element(_cachedTemplate.trim());

          _modal = $compile(_template)(_scope);
          _body.append(_modal);

          if (angular.isFunction(modalOptions.controller)) {
            _ctrl = $controller(modalOptions.controller, { $scope: _scope, modalId: _modalId });
          }

          _modal.modal({ show: false });
          _modals[_modalId] = _modal;
        }
        return _modalId;
      };

      /**
       * Helper method to return modal instance from _modals
       * @param modalId ID of the modal to return the instance from
       * @returns {angular.element} Modal instance (DOM element)
       */
      var getModal = function (modalId) {
        if (_modals[modalId]) {
          return _modals[modalId].find('.modal');
        } else {
          throw new Error('Modal service: modal "' + modalId + '" not found. Please call "create" method first.');
        }
      };

      /**
       *
       * @ngdoc function
       * @name mwModal.Modal#show
       * @methodOf mwModal.Modal
       * @function
       * @description Shows the modal
       * @param {String} modalId Modal identifier
       */
      this.show = function (modalId) {
        getModal(modalId).modal('show');
      };

      /**
       *
       * @ngdoc function
       * @name mwModal.Modal#hide
       * @methodOf mwModal.Modal
       * @function
       * @description Hides the modal
       * @param {String} modalId Modal identifier
       */
      this.hide = function (modalId) {
        getModal(modalId).modal('hide');
      };

      /**
       *
       * @ngdoc function
       * @name mwModal.Modal#toggle
       * @methodOf mwModal.Modal
       * @function
       * @description Toggles the modal
       * @param {String} modalId Modal identifier
       */
      this.toggle = function (modalId) {
        getModal(modalId).modal('toggle');
      };
    })


/**
 * @ngdoc directive
 * @name mwModal.directive:mwModal
 * @element div
 * @description
 * Shortcut directive for Bootstraps modal.
 *
 * @scope
 *
 * @param {string} title Modal title
 * @example
 * <doc:example>
 *   <doc:source>
 *     <div mw-modal title="My modal">
 *       <div mw-modal-body>
 *         <p>One fine body&hellip;</p>
 *       </div>
 *       <div mw-modal-footer>
 *         <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
 *         <button type="button" class="btn btn-primary">Save changes</button>
 *       </div>
 *     </div>
 *   </doc:source>
 * </doc:example>
 */

    .directive('mwModal', function () {
      return {
        restrict: 'A',
        scope: {
          title: '@'
        },
        transclude: true,
        templateUrl: 'modules/ui/templates/mwModal.html'
      };
    })

/**
 * @ngdoc directive
 * @name mwModal.directive:mwModalBody
 * @element div
 * @description
 * Shortcut directive for Bootstraps body. See {@link mwModal.directive:mwModal `mwModal`} for more information
 * about mwModal.
 */
    .directive('mwModalBody', function () {
      return {
        restrict: 'A',
        transclude: true,
        template: '<div class="modal-body" ng-transclude></div>'
      };
    })

/**
 * @ngdoc directive
 * @name mwModal.directive:mwModalFooter
 * @element div
 * @description
 * Shortcut directive for Bootstraps footer. See {@link mwModal.directive:mwModal `mwModal`} for more information
 * about mwModal.
 */
    .directive('mwModalFooter', function () {
      return {
        restrict: 'A',
        transclude: true,
        template: '<div class="modal-footer" ng-transclude></div>'
      };
    });