'use strict';

(function () {

  // Common used function to put defaults onto some HTML elements
  var extendHTMLElement = function () {
    return {
      restrict: 'E',
      link: function (scope, elm) {
        var skipTheFollowing = ['checkbox', 'radio'];

        if (skipTheFollowing.indexOf(elm.attr('type')) === -1 && scope.$$prevSibling) {
          // Add default class coming from bootstrap
          elm.addClass('form-control');
          if (scope.$$prevSibling) {
            // Register on mwFormInput if element is surrounded by mwFormInput
            if (angular.isFunction(scope.$$prevSibling.mwFormInputRegister)) {
              scope.$$prevSibling.mwFormInputRegister(elm);
            }
          }
        }
      }
    };
  };


  angular.module('mwForm', [])

  /**
   * @ngdoc directive
   * @name mwForm.directive:mwFormInput
   * @element div
   * @description
   *
   * Wrapper for input elements. Adds validation messages, form HTML and corresponding CSS.
   * The following elements can register itself on mwFormInput:
   *
   * - select
   * - input[text]
   * - textarea
   *
   * @scope
   *
   * @param {string} label Label to show
   * @param {expression} hideErrors If true, doesn't show validation messages. Default is false
   *
   */
    .directive('mwFormInput', function (i18n) {
      return {
        restrict: 'A',
        transclude: true,
        scope: {
          label: '@',
          tooltip: '@',
          hideErrors: '='
        },
        templateUrl: 'modules/ui/templates/mwForm/mwFormInput.html',
        link: function (scope, elm) {
          scope.isInvalid = function () {
            var ctrl = elm.inheritedData('$formController'),
              invalid = false;
            if (ctrl) {
              invalid = ctrl[scope.elementName].$invalid;
            }
            return invalid;
          };
        },
        controller: function ($scope) {
          var that = this;
          that.element = null;
          $scope.mwFormInputRegister = function (element) {
            if (!that.element) {
              that.element = element;
              $scope.elementName = element.attr('name');

              var buildValidationValues = function () {
                $scope.validationValues = {
                  required: i18n.get('errors.isRequired'),
                  email: i18n.get('errors.hasToBeAnEmail'),
                  pattern: i18n.get('errors.hasToMatchPattern'),
                  url: i18n.get('errors.validUrl'),
                  min: i18n.get('errors.minValue', { count: element.attr('min') }),
                  minlength: i18n.get('errors.minLength', { count: element.attr('ng-minlength') }),
                  max: i18n.get('errors.maxValue', { count: element.attr('max') }),
                  maxlength: i18n.get('errors.maxLength', { count: element.attr('ng-maxlength') }),
                  phone: i18n.get('errors.phoneNumber'),
                  unique: i18n.get('errors.notUnique'),
                  match: i18n.get('errors.doesNotMatch')
                };
              };
              buildValidationValues();
              $scope.$on('i18n:localeChanged', buildValidationValues);
            }
          };
        }
      };
    })

  /**
   * @ngdoc directive
   * @name mwForm.directive:mwMultiSelect
   * @element div
   * @description
   *
   * Can be used for a selectbox where multiple values can be selected
   * Generates checkboxes and pushes or removes values into an array
   *
   * @scope
   *
   * @param {expression} model Model where the selected values should be saved in
   * @param {expression} options Options which can be selected
   *
   */
    .directive('mwFormMultiSelect', function () {
      return {
        restrict: 'A',
        transclude: true,
        scope: {
          model: '=',
          options: '='
        },
        templateUrl: 'modules/ui/templates/mwForm/mwFormMultiSelect.html',
        controller: function ($scope) {

          if (!angular.isArray($scope.model)) {
            $scope.model = [];
          }

          if (angular.isArray($scope.options)) {
            var objOptions = {};
            $scope.options.forEach(function (option) {
              objOptions[option] = option;
            });

            $scope.options = objOptions;
          }

          $scope.toggleKeyIntoModelArray = function (key) {

            $scope.model = $scope.model || [];
            //Check if key is already in the model array
            //When user unselects a checkbox it will be deleted from the model array
            if ($scope.model.indexOf(key) >= 0) {
              // Delete key from model array
              $scope.model.splice($scope.model.indexOf(key), 1);
              // Delete model if no attribute is in there (for validation purposes)
              if ($scope.model.length === 0) {
                delete $scope.model;
              }
            } else {
              $scope.model.push(key);
            }
          };

        }
      };
    })

  /**
   * @ngdoc directive
   * @name mwForm.directive:mwFormCheckbox
   * @element div
   * @description
   *
   * Wrapper for checkbox elements. Adds form HTML and corresponding CSS.
   *
   * @scope
   *
   * @param {string} label Label to show
   *
   */
    .directive('mwFormCheckbox', function () {
      return {
        restrict: 'A',
        replace: true,
        transclude: true,
        scope: {
          label: '@',
          tooltip: '@',
          badges: '@'
        },
        templateUrl: 'modules/ui/templates/mwForm/mwFormCheckbox.html',
        link: function (scope) {
          if (scope.badges) {
            scope.splittedBadges = scope.badges.split(',');
          }
        }
      };
    })

    .directive('mwCustomCheckbox', function ($window) {
      return {
        restrict: 'A',
        replace: true,
        require: '?ngModel',
        transclude: true,
        link: function (scope, el, attr, ngModel) {


          // set the active class on the checkbox wrapper
          var setActiveClass = function (checked) {
            if (checked) {
              el.parent().addClass('active');
            } else {
              el.parent().removeClass('active');
            }
          };

          // render custom checkbox
          // to preserve the functionality of the original checkbox we just wrap it with a custom element
          // checkbox is set to opacity 0 and has to be position absolute inside the custom checkbox element hwich has to position relative
          // additionally a custom status indicator is appended as a sibling of the original checkbox inside the custom checkbox wrapper
          var render = function(){
            var customCheckbox = angular.element('<span class="custom-checkbox mw-checkbox"></span>'),
              customCheckboxStateIndicator = angular.element('<span class="state-indicator"></span>');

            el.wrap(customCheckbox);
            customCheckboxStateIndicator.insertAfter(el);
          };

          (function init(){

            //check the value every time the checkbox is clicked
            el.on('change', function () {
              setActiveClass(el.is(':checked'));
            });

            if (ngModel) {
              //when a model is defined use the value which is passed into the formatters function during initialization
              ngModel.$formatters.unshift(function (checked) {
                setActiveClass(checked);
                return checked;
              });
            }

            //jQuery does not trigger a change event when checkbox is checked programmatically e.g. by ng-checked
            //property hooks triggers a change event everytime the setter is called
            //TODO find a better solution for this
            $window.$.propHooks.checked = {
              set: function (el, value) {

                var trigger;
                if (el.checked !== value) {
                  trigger = true;
                } else {
                  trigger = false;
                }
                el.checked = value;
                if (trigger) {
                  $window.$(el).trigger('change');
                }
              }
            };

            render();
          }());
        }
      };
    })

  /**
   * @ngdoc directive
   * @name mwForm.directive:mwFormWrapper
   * @element div
   * @description
   *
   * Wrapper for custom elements. Adds form HTML and corresponding CSS.
   * Does not include validation or any other functional components.
   *
   * @scope
   *
   * @param {string} label Label to show
   * @param {string} tooltip Tooltip to display
   *
   */
    .directive('mwFormWrapper', function () {
      return {
        restrict: 'A',
        replace: true,
        transclude: true,
        scope: {
          label: '@',
          tooltip: '@'
        },
        templateUrl: 'modules/ui/templates/mwForm/mwFormWrapper.html'
      };
    })


  /**
   * @ngdoc directive
   * @name mwForm.directive:mwFormValidation
   * @element span
   * @description
   * **Important!:** Can only be placed inside of {@link mwForm.directive:mwFormInput mwFormInput}.
   *
   * Adds validation messages if validation for given key fails.
   *
   * @scope
   *
   * @param {string} mwFormsValidation The key to validate a model
   */
    .directive('mwFormValidation', function () {
      return {
        restrict: 'A',
        replace: true,
        transclude: true,
        require: '^mwFormInput',
        scope: {
          validation: '@mwFormValidation'
        },
        template: '<span class="help-block" ng-show="isValid()" ng-transclude></span>',
        link: function (scope, elm, attr, mwFormInputCtrl) {

          var inputName = mwFormInputCtrl.element.attr('name'),
            form = elm.inheritedData('$formController'),
            invalid = false;

          if (!inputName) {
            invalid = true;
            throw new Error('element doesn\'t have name attribute');
          }

          if (form && !form[inputName]) {
            invalid = true;
            throw new Error('element ' + inputName + ' not found');
          }

          scope.isValid = function () {
            if (invalid || !form) {
              return false;
            } else {
              return form[inputName].$error[scope.validation];
            }
          };
        }
      };
    })

  /**
   * @ngdoc directive
   * @name mwForm.directive:mwForm
   * @element form
   * @description
   *
   * Adds form specific behaviour
   *
   */
    .directive('form', function () {
      return {
        restrict: 'E',
        link: function (scope, elm) {
          elm.addClass('form-horizontal');
          elm.attr('novalidate', 'true');
        }
      };
    })

  /**
   * @ngdoc directive
   * @name mwForm.directive:mwFormActions
   * @element form
   * @description
   *
   * Adds buttons for save and cancel. Must be placed inside a form tag.
   * (Form controller has to be available on the parent scope!)
   *
   * @scope
   *
   * @param {expression} save Expression to evaluate on click on 'Save' button
   * @param {expression} cancel Expression to evaluate on click on 'cancel' button
   *
   */
    .directive('mwFormActions', function () {
      return {
        replace: true,
        require: '^form',
        scope: {
          save: '&',
          cancel: '&'
        },
        templateUrl: 'modules/ui/templates/mwForm/mwFormActions.html',
        link: function (scope, elm, attr, formCtrl) {
          scope.form = formCtrl;
          scope.hasCancel = attr.cancel;
          scope.hasSave = attr.save;
        }
      };
    })


  /**
   * @ngdoc directive
   * @name mwForm.directive:select
   * @restrict E
   * @description
   *
   * Extends the select element, by adding class 'form-control' and registers
   * it on {@link mwForm.directive:mwFormInput mwFormInput}.
   *
   */
    .directive('select', extendHTMLElement)


  /**
   * @ngdoc directive
   * @name mwForm.directive:input
   * @restrict E
   * @description
   *
   * Extends the input[text] element, by adding class 'form-control' and
   * registers it on {@link mwForm.directive:mwFormInput mwFormInput}.
   *
   */
    .directive('input', extendHTMLElement)

  /**
   * @ngdoc directive
   * @name mwForm.directive:textarea
   * @restrict E
   * @description
   *
   * Extends the textarea element, by adding class 'form-control' and
   * registers it on {@link mwForm.directive:mwFormInput mwFormInput}.
   *
   */
    .directive('textarea', extendHTMLElement);


})();


