'use strict';
describe('base usage: model directive', function () {
  var form,
    $compile,
    $scope,
    helper,
    body;

  function createElem(template, parent) {
    var elem = $compile(template)($scope);
    parent = parent || body;
    parent.append(elem);
    $scope.$digest();
    return elem;
  }

  beforeEach(function () {
    module('gg.yavd');
    inject(function (_$compile_, _$rootScope_, $document, _YavdHelper_) {
      $compile = _$compile_;
      $scope = _$rootScope_.$new();
      body = $document.find('body').empty();
      helper = _YavdHelper_;
    });
    form = createElem('<form yavd></form>');
  });

  it('should not work without parent form', function () {
    expect(function () {
      createElem('<input ng-model="test" vld/>');
    }).toThrow();

    expect(function () {
      createElem('<form yavd><input ng-model="test" vld/></form>');
    }).not.toThrow();
  });

  it('should have an empty message element', function () {
    var form = createElem('<form yavd><input ng-model="test" vld/></form>');
    var input = form.find('input');
    var messageElement = input.data('message-element');
    expect(messageElement).toBeTruthy();
    expect(messageElement.text()).toBe('');
    expect(messageElement[0]).toBeHidden();
  });

  it('shows error message when item is invalid and blurred', function () {
    var form = createElem('<form yavd><input ng-model="test" required vld/></form>');
    var input = form.find('input');
    var messageElement = input.data('message-element');
    expect(messageElement[0]).toBeHidden();

    input.triggerHandler('blur');
    $scope.$digest();
    expect(messageElement[0]).toBeVisible();

    $scope.test = 'something';
    input.triggerHandler('blur');
    $scope.$digest();
    expect(messageElement[0]).toBeHidden();
  });

  it('hides the error message as soon as the item is valid', function () {
    var form = createElem('<form yavd><input ng-model="test" required vld/></form>');
    var input = form.find('input');
    var messageElement = input.data('message-element');
    input.triggerHandler('blur');
    $scope.$digest();
    expect(messageElement[0]).toBeVisible();

    $scope.test = 'bla bla';
    $scope.$digest();
    input.triggerHandler('blur');
    expect(messageElement[0]).toBeHidden();
  });

  it('changes the error type when needed', function () {
    var form = createElem('<form yavd><input ng-model="test" required minlength="4" vld/></form>');
    var input = form.find('input');
    var messageElement = input.data('message-element');
    $scope.$digest();
    expect(messageElement.text()).toBe(helper.getErrorMessage({required: true}, input));
    $scope.test = 'bla';
    $scope.$digest();
    expect(messageElement.text()).toBe(helper.getErrorMessage({minlength: true}, input));
  });

});

describe('option overrides: model directive', function () {
  var $compile,
    $scope,
    helper,
    body;

  function createElem(template, parent) {
    var elem = $compile(template)($scope);
    parent = parent || body;
    parent.append(elem);
    $scope.$digest();
    return elem;
  }

  beforeEach(function () {
    module('gg.yavd');
    inject(function (_$compile_, _$rootScope_, $document, _YavdHelper_) {
      $compile = _$compile_;
      $scope = _$rootScope_.$new();
      body = $document.find('body').empty();
      helper = _YavdHelper_;
    });
  });

  //show triggers
  it('should support show keydown trigger', function () {
    helper.setOptions({showTrigger: 'keydown'});
    var form = createElem('<form yavd><input ng-model="test" required vld/></form>');
    var input = form.find('input');
    var messageElement = input.data('message-element');

    $scope.test = 'something';
    $scope.$digest();
    $scope.test = '';
    $scope.$digest();
    input.triggerHandler('keydown');
    $scope.$digest();
    expect(messageElement[0]).toBeVisible();
  });

  it('should support show submit trigger', function () {
    helper.setOptions({showTrigger: 'submit'});

    var form = createElem('<form yavd><input ng-model="test" required vld/></form>');
    var input = form.find('input');
    var messageElement = input.data('message-element');

    $scope.test = '';
    $scope.$digest();
    form.triggerHandler('submit');
    $scope.$digest();
    expect(messageElement[0]).toBeVisible();
  });

  it('throws error when unsupported show trigger is used', function () {
    helper.setOptions({showTrigger: 'unsupported'});
    expect(function () {
      createElem('<form yavd><input ng-model="test" required vld/></form>');
    }).toThrow();
  });

  it('should support change hide trigger', function () {
    helper.setOptions({hideTrigger: 'keydown'});
    var form = createElem('<form yavd><input ng-model="test" required vld/></form>');
    var input = form.find('input');
    var messageElement = input.data('message-element');

    input.triggerHandler('blur');
    $scope.$digest();
    expect(messageElement[0]).toBeVisible();

    input.triggerHandler('keydown');
    $scope.$digest();
    expect(messageElement[0]).toBeHidden();
  });

  it('throws error when unsupported hide trigger is used', function () {
    helper.setOptions({hideTrigger: 'unsupported'});
    expect(function () {
      createElem('<form yavd><input ng-model="test" required vld/></form>');
    }).toThrow();
  });

  it('supports changing template via helper', function () {
    helper.setOptions({messageTemplate: '<a>{{errorMessage}}</a>'});
    var form = createElem('<form yavd><input ng-model="test" required vld/></form>');
    var input = form.find('input');
    var messageElement = input.data('message-element');

    expect(messageElement[0].tagName).toBe('A');
//    expect(messageElement.is('a')).toBeTruthy();
  });

  it('supports changing template via input', function () {
    var form = createElem('<form yavd><input ng-model="test" required vld="{messageTemplate: \'<a></a>\'}"/></form>');
    var input = form.find('input');
    var messageElement = input.data('message-element');
    expect(messageElement[0].tagName).toBe('A');
  });

  it('supports changing template via form', function () {
    var form = createElem('<form yavd="{messageTemplate: \'<a></a>\'}"><input ng-model="test" required vld/></form>');
    var input = form.find('input');
    var messageElement = input.data('message-element');
    expect(messageElement[0].tagName).toBe('A');
  });

  it('will get first input settings, if form settings are also given', function () {
    var form = createElem('<form yavd="{messageTemplate: \'<a></a>\'}"><input ng-model="test" required vld="{messageTemplate: \'<p></p>\'}"/></form>');
    var input = form.find('input');
    var messageElement = input.data('message-element');
    expect(messageElement[0].tagName).toBe('P');
  });

  it('supports parent class changing (for bootstrap)', function () {
    var form = createElem(
        '<form yavd="{messageTemplate: \'<a></a>\'}">' +
        '<div class="form-group">' +
        '<input ng-model="test" required vld/>' +
        '</div>' +
        '</form>');
    var formGroup = form.find('div');
    var input = form.find('input');
    var opts = helper.getOptions();

    input.triggerHandler('blur');
    $scope.$digest();
    expect(formGroup.hasClass(opts.parentErrorClassName)).toBeTruthy();

    $scope.test = 'one two three';
    $scope.$digest();
    expect(formGroup.hasClass(opts.parentErrorClassName)).toBeFalsy();
  });

  it('should support custom error messages', function () {
    var form = createElem('<form yavd>' +
      '<input ng-model="test" required vld="{errorMessages:{required: \'Must fill this one!\'}}"/>' +
      '</form>');
    var input = form.find('input');
    var messageElement = input.data('message-element');
    $scope.$digest();
    input.triggerHandler('blur');
    $scope.$digest();
    expect(messageElement.text()).toBe('Must fill this one!');
  });

});
