describe('mwViewChangeLoader', function () {
  var $compile;
  var $rootScope;
  var scope;

  beforeEach(module('mwUI'));

  beforeEach(inject(function (_$compile_, _$rootScope_) {
    $compile = _$compile_;
    $rootScope = _$rootScope_;
    scope = _$rootScope_.$new();

    var changeLoader = '<div mw-view-change-loader></div>';
    var el = $compile(changeLoader)(scope);
    scope.$digest();
  }));

  it('should register listeners', function () {
    expect(scope.model.loading).toBe(false);

    expect(typeof $rootScope.$$listeners.$locationChangeSuccess[0]).toBe('function');
    expect(typeof $rootScope.$$listeners.$routeChangeSuccess[0]).toBe('function');
    expect(typeof $rootScope.$$listeners.$routeChangeError[0]).toBe('function');
  });

  it('should not have listeners when scope is destroyed', function () {
    scope.$destroy();

    expect($rootScope.$$listeners.$locationChangeSuccess[0]).toBe(null);
    expect($rootScope.$$listeners.$routeChangeSuccess[0]).toBe(null);
    expect($rootScope.$$listeners.$routeChangeError[0]).toBe(null);
  });

  it('should activate spinner on location change', function () {
    $rootScope.$broadcast('$locationChangeSuccess');
    expect(scope.model.loading).toBe(true);
  });

  it('should deactivate spinner on route change', function () {
    scope.model.loading = true;
    $rootScope.$broadcast('$routeChangeSuccess');
    expect(scope.model.loading).toBe(false);
  });

  it('should deactivate spinner on route change error', function () {
    scope.model.loading = true;
    $rootScope.$broadcast('$routeChangeError');
    expect(scope.model.loading).toBe(false);
  });

  it('should not change model when scope is destroyed', function () {
    $rootScope.$broadcast('$locationChangeSuccess');
    expect(scope.model.loading).toBe(true);

    scope.$destroy();
    $rootScope.$broadcast('$routeChangeSuccess');
    expect(scope.model.loading).toBe(true);
  });

});
