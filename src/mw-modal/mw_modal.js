angular.module('mwUI.Modal', []);

// @include ./directives/mw_modal.js
// @include ./directives/mw_modal_body.js
// @include ./directives/mw_modal_confirm.js
// @include ./directives/mw_modal_footer.js

// @include ./modals/mw_exception_modal.js

// @include ./services/mw_modal.js
// @include ./services/mw_modal_template.js

// @include ./shims/bootstrap_modal.js

angular.module('mwUI.Modal')

  .config(function(i18nProvider){
    i18nProvider.addResource('uikit/mw-modal/i18n');
  });