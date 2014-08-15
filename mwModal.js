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
    .service('Modal', function ($rootScope, $templateCache, $document, $compile, $controller, $q, $http) {

      var body = $document.find('body').eq(0);

      var Modal = function(modalOptions){

        var _id = modalOptions.templateUrl,
            _scope = (modalOptions.scope || $rootScope).$new(),
            _controller = modalOptions.controller,
            _self = this,
            _cachedTemplate,
            _modal,
            _bootstrapModal;

        var _getTemplate = function () {
          if (!_id) {
            throw new Error('Modal service: templateUrl options is required.');
          }

          // Get template from cache
          _cachedTemplate = $templateCache.get(_id);

          if (_cachedTemplate) {
            return $q.when(_cachedTemplate);
          } else {
            return $http.get(_id).then(function (resp) {
              $templateCache.put(_id, resp.data);
              return resp.data;
            }, function () {
              throw new Error('Modal service: template \'' + _id + '\' has not been found. Does a template with this ID/Path exist?');
            });
          }
        };

        var _bindModalCloseEvent = function(){
          _bootstrapModal.on('hidden.bs.modal',function(){
            _self.destroy();
          });
        };

        var _buildModal = function(){
          var dfd = $q.defer();

          if (_controller) {
            $controller(_controller, { $scope: _scope, modalId: _id });
          }

          _scope.hideModal = function(){
            return _self.hide();
          };

          _getTemplate().then(function(template){
            _modal = $compile(template.trim())(_scope);
            _scope.$on('COMPILE:FINISHED',function(){
              _modal.addClass('mw-modal');
              _bootstrapModal = _modal.find('.modal');
              _bindModalCloseEvent();
              dfd.resolve();
            });
          });

          return dfd.promise;
        };

        /**
         *
         * @ngdoc function
         * @name mwModal.Modal#show
         * @methodOf mwModal.Modal
         * @function
         * @description Shows the modal
         */
        this.show = function () {
          body.css({
            height:'100%',
            width: '100%',
            overflow:'hidden'
          });
          _buildModal().then(function(){
            body.append(_modal);
            _bootstrapModal.modal('show');
          });
        };


        this.setScopeAttributes = function(obj){
          if(_.isObject(obj)){
            _.extend(_scope, obj);
          }
        };

        /**
         *
         * @ngdoc function
         * @name mwModal.Modal#hide
         * @methodOf mwModal.Modal
         * @function
         * @description Hides the modal
         * @returns {Object} Promise which will be resolved when modal is successfully closed
         */
        this.hide = function () {
          var dfd = $q.defer();
          if(_bootstrapModal){
            _bootstrapModal.modal('hide');
            _bootstrapModal.on('hidden.bs.modal', function () {
              _self.destroy();
              dfd.resolve();
            });
          } else {
            dfd.reject();
          }

          return dfd.promise;
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
        this.toggle = function () {
          _bootstrapModal.modal('toggle');
        };

        /**
         *
         * @ngdoc function
         * @name mwModal.Modal#destroy
         * @methodOf mwModal.Modal
         * @function
         * @description Removes the modal from the dom
         */
        this.destroy = function () {
          body.css({
            height:'',
            width: '',
            overflow:''
          });
          if(_modal){
            _modal.remove();
          }
        };

        (function main(){

          _getTemplate();

          _scope.$on('$destroy', function () {
            _self.hide();
          });


        })();

      };

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
       * @returns {Object} Modal
       */
      this.create = function (modalOptions) {
        return new Modal(modalOptions);
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
        templateUrl: 'modules/ui/templates/mwModal/mwModal.html',
        link:function(scope){
          scope.$emit('COMPILE:FINISHED');
        }
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
        replace: true,
        template: '<div class="modal-body clearfix" ng-transclude></div>'
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
        replace: true,
        template: '<div class="modal-footer" ng-transclude></div>'
      };
    })

/**
 * @ngdoc directive
 * @name mwModal.directive:mwModalOnEnter
 * @element button
 * @description
 * Adds ability to trigger button with enter key. Checks validation if button is part of a form.
 */
    .directive('mwModalOnEnter', function () {
      return {
        restrict: 'A',
        require: '?^form',
        link: function (scope, elm, attr, ctrl) {
          elm.parents('.modal').first().on('keyup', function (event) {
            if (event.keyCode === 13 && event.target.nodeName !== 'SELECT') {
              if ((ctrl && ctrl.$valid) || !ctrl) {
                elm.click();
              }
            }
          });
        }
      };
    })

/**
 * @ngdoc directive
 * @name mwModal.directive:mwModalConfirm
 * @element div
 * @description
 *
 * Opens a simple confirm modal.
 *
 * @scope
 *
 * @param {expression} ok Expression to evaluate on click on 'ok' button
 * @param {expression} cancel Expression to evaluate on click on 'cancel' button
 */
    .directive('mwModalConfirm', function () {
      return {
        restrict: 'A',
        transclude: true,
        scope: true,
        templateUrl: 'modules/ui/templates/mwModal/mwModalConfirm.html',
        link: function (scope, elm, attr) {
          angular.forEach(['ok', 'cancel'], function (action) {
            scope[action] = function () {
              scope.$eval(attr[action]);
            };
          });

        }
      };
    });