'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.handlePromiseSaga = exports.formActionSaga = exports.createFormAction = exports.PROMISE = undefined;

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _effects = require('redux-saga/effects');

var _marked = [handlePromiseSaga, formActionSaga].map(regeneratorRuntime.mark);

var identity = function identity(i) {
  return i;
};
var PROMISE = '@@redux-form-saga/PROMISE';
var status = ['REQUEST', 'SUCCESS', 'FAILURE'];

function createFormAction(requestAction, types) {
  var payloadCreator = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : identity;

  var actionMethods = {};
  var formAction = function formAction(payload) {
    return {
      type: PROMISE,
      payload: payload
    };
  };

  // Allow a type prefix to be passed in
  if (typeof requestAction === 'string') {
    requestAction = status.map(function (s) {
      var a = requestAction + '_' + s;
      var subAction = function subAction(payload) {
        return {
          type: a,
          payload: payloadCreator(payload)
        };
      };

      // translate specific actionType to generic actionType
      actionMethods[s] = a;
      actionMethods[s.toLowerCase()] = subAction;

      return subAction;
    })[0];

    if (types) {
      payloadCreator = types;
    }

    types = [actionMethods.SUCCESS, actionMethods.FAILURE];
  }

  if (types.length !== 2) {
    throw new Error('Must include two action types: [ SUCCESS, FAILURE ]');
  }

  return Object.assign(function (data, dispatch) {
    return new Promise(function (resolve, reject) {
      dispatch(formAction({
        request: requestAction(data),
        defer: { resolve: resolve, reject: reject },
        types: types
      }));
    });
  }, actionMethods);
};

function handlePromiseSaga(_ref) {
  var payload = _ref.payload;

  var request, defer, types, resolve, reject, _types, SUCCESS, FAIL, _ref2, _ref3, winner;

  return regeneratorRuntime.wrap(function handlePromiseSaga$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          request = payload.request, defer = payload.defer, types = payload.types;
          resolve = defer.resolve, reject = defer.reject;
          _types = _slicedToArray(types, 2), SUCCESS = _types[0], FAIL = _types[1];
          _context.next = 5;
          return [(0, _effects.race)({
            success: (0, _effects.take)(SUCCESS),
            fail: (0, _effects.take)(FAIL)
          }), (0, _effects.put)(request)];

        case 5:
          _ref2 = _context.sent;
          _ref3 = _slicedToArray(_ref2, 1);
          winner = _ref3[0];

          if (!winner.success) {
            _context.next = 13;
            break;
          }

          _context.next = 11;
          return (0, _effects.call)(resolve, winner.success && winner.success.payload ? winner.success.payload : winner.success);

        case 11:
          _context.next = 15;
          break;

        case 13:
          _context.next = 15;
          return (0, _effects.call)(reject, winner.fail && winner.fail.payload ? winner.fail.payload : winner.fail);

        case 15:
        case 'end':
          return _context.stop();
      }
    }
  }, _marked[0], this);
}

function formActionSaga() {
  return regeneratorRuntime.wrap(function formActionSaga$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _context2.next = 2;
          return (0, _effects.takeEvery)(PROMISE, handlePromiseSaga);

        case 2:
        case 'end':
          return _context2.stop();
      }
    }
  }, _marked[1], this);
}

exports.PROMISE = PROMISE;
exports.createFormAction = createFormAction;
exports.formActionSaga = formActionSaga;
exports.handlePromiseSaga = handlePromiseSaga;
exports.default = formActionSaga;