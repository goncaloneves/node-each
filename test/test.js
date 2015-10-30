'use strict';

/** Requires */
var nodeEach = require('./../lib/index.js'),
    Promise = require('bluebird'),
    expect = require('chai').expect;

/**
 *
 * Node Each Module Tests
 * Description: Tests are done using Chai expect BDD assertion
 *
 * */
describe('node-each', function() {

    /** Test globals */
    var asyncTime = 1,
        emptyArray = [],
        testArray = [];
    for (var i = 0, length = 23; i < length; ++i) {
        testArray.push({iteration: i});
    }
    /**
     * Async Callback
     * @returns {Promise} - Returns promise that needs to be fulfilled before next iteration
     * */
    function asyncCallback() {
        return new Promise(function(resolve) {
            setTimeout(function() {
                resolve();
            }, asyncTime);
        });
    }
    /**
     * Empty Callback
     * */
    function emptyCallback() {}

    /**
     * Each Function tests
     * */
    describe('each', function() {

        /** Increase timeout */
        this.timeout(5000);

        it('should be a function', function() {
            expect(nodeEach.each).to.be.a('function');
        });

        it('should throw when given no arguments', function () {
            expect(nodeEach.each).to.throw('async-each first argument must be the collection array for iteration');
        });

        it('should have first argument of array type', function() {
            function invalidParameterTest() {
                nodeEach.each('not an array', emptyCallback);
            }

            function validParameterTest() {
                nodeEach.each(emptyArray, emptyCallback);
            }

            expect(invalidParameterTest).to.throw('async-each first argument must be the collection array for iteration');
            expect(validParameterTest).not.to.throw();
        });

        it('should have second argument of function type', function() {
            function invalidParameterTest() {
                nodeEach.each(emptyArray, 'not a function');
            }

            function validParameterTest() {
                nodeEach.each(emptyArray, emptyCallback);
            }

            expect(invalidParameterTest).to.throw('async-each second argument must be the iteration callback function');
            expect(validParameterTest).not.to.throw();
        });

        it('should have third argument of object type', function() {
            function invalidParameterTest() {
                nodeEach.each(emptyArray, emptyCallback, 'not an object');
            }

            function validParameterTest() {
                nodeEach.each(emptyArray, emptyCallback, {});
            }

            expect(invalidParameterTest).to.throw('async-each third argument must be the options object');
            expect(validParameterTest).not.to.throw();
        });

        it('should return a promise', function() {
            var promise = nodeEach.each(testArray, emptyCallback);
            expect(promise.then).to.be.a('function');
        });

        it('should iterate array and run callback with value and key parameters', function() {
            function callback(val, i) {
                if (testArray.length) {
                    expect(val).to.exist;
                    expect(val).to.deep.equal(testArray[i]);
                }
                expect(i).to.exist;
                expect(i).to.be.an('number');
            }

            nodeEach.each(testArray, callback);
        });

        it('should resolve promise when all iterations are finished', function() {
            var callbackArray = emptyArray;

            function callback(el) {
                if (testArray.length) {
                    callbackArray.push(el);
                }
            }

            nodeEach.each(testArray, callback).then(function() {
                expect(callbackArray).to.have.length(testArray.length);
                expect(callbackArray).to.deep.equal(testArray);
            });
        });

        /**
         * Options object tests
         * */
        describe('options object', function() {
            /** Test variables */
            var debugTrue = {
                debug: true
            };

            var debugFalse = {
                debug: false
            };

            /** Options debug flag tests */
            describe('debug flag', function() {
                it('should return undefined parameter in promise fulfill handler when debug boolean is undefined or false', function() {
                    nodeEach.each(testArray, emptyCallback).then(function(debug) {
                        expect(debug).to.be.undefined;
                    });

                    nodeEach.each(testArray, emptyCallback, debugFalse).then(function(debug) {
                        expect(debug).to.be.undefined;
                    });
                });

                it('should return object parameter in promise fulfill handler when debug boolean is true', function() {
                    nodeEach.each(testArray, emptyCallback, debugTrue).then(function(debug) {
                        expect(debug).to.exist;
                        expect(debug).to.be.an('object');
                        expect(debug).to.have.all.keys(['average', 'duration', 'iterations', 'loops', 'on', 'when']);
                    });
                });
            });

            /** Options properties tests */
            describe('properties', function() {
                it('should have average of number type above zero', function() {
                    nodeEach.each(testArray, emptyCallback, debugTrue).then(function(debug) {
                        expect(debug.average).to.be.an('number');
                        expect(debug.average).to.be.above(0);
                    });
                });

                it('should have duration of number type above 0', function() {
                    nodeEach.each(testArray, emptyCallback, debugTrue).then(function(debug) {
                        expect(debug.duration).to.be.an('number');
                        expect(debug.duration).to.be.above(0);
                    });
                });

                it('should have iterations of number type equal to array length', function() {
                    nodeEach.each(testArray, emptyCallback, debugTrue).then(function(debug) {
                        expect(debug.iterations).to.be.an('number');
                        expect(debug.iterations).to.equal(testArray.length);
                    });
                });

                it('should have loops of number type at least 0', function() {
                    nodeEach.each(testArray, emptyCallback, debugTrue).then(function(debug) {
                        expect(debug.loops).to.be.an('number');
                        expect(debug.loops).to.be.at.least(0);
                    });
                });
            });

            /** Options default tests */
            describe('defaults', function() {
                it('should have on property equal to iteration', function() {
                    nodeEach.each(testArray, emptyCallback, debugTrue).then(function(debug) {
                        expect(debug).to.have.property('on', 'iteration');
                    });
                });

                it('should have when property equal to 1', function() {
                    nodeEach.each(testArray, emptyCallback, debugTrue).then(function(debug) {
                        expect(debug).to.have.property('when', 1);
                    });
                });

                it('should have loops property equal to length of array if is greather than 0 or 1', function() {
                    nodeEach.each(testArray, emptyCallback, debugTrue).then(function(debug) {
                        expect(debug).to.have.property('loops', testArray.length ? testArray.length : 1);
                    });
                });
            });

            /** Options on interation tests */
            describe('on iteration setting', function() {
                /** Test variables */
                var loops = testArray.length > 1 ? 2 : 1,
                    options = {
                        debug: true,
                        on: 'iteration',
                        when: loops === 2 ? Math.floor(testArray.length / loops) : 1
                    };

                it('should have iterations property equal to array length', function() {
                    nodeEach.each(testArray, emptyCallback, options).then(function(debug) {
                        expect(debug).to.have.property('iterations', testArray.length);
                    });
                });

                it('should have loops property to be at least loops', function() {
                    nodeEach.each(testArray, emptyCallback, options).then(function(debug) {
                        expect(debug.loops).to.be.at.least(loops);

                    });
                });

                it('should have on property equal to options.on', function() {
                    nodeEach.each(testArray, emptyCallback, options).then(function(debug) {
                        expect(debug).to.have.property('on', options.on);
                    });
                });

                it('should have when property equal to options.when', function() {
                    nodeEach.each(testArray, emptyCallback, options).then(function(debug) {
                        expect(debug).to.have.property('when', options.when);
                    });
                });
            });

            /** Options on time tests */
            describe('on time setting', function() {
                /** Test variables */
                var options = {
                    debug: true,
                    on: 'time',
                    when: 5
                };

                it('should have average property equal to duration divided by array length', function() {
                    return nodeEach.each(testArray, asyncCallback, options).then(function(debug) {
                        if (testArray.length) {
                            expect(debug).to.have.property('average', debug.duration / testArray.length);
                        } else {
                            expect(debug).to.have.property('average', debug.duration);
                        }
                    });
                });

                it('should have duration at least asyncTime milliseconds multiplied by array length', function() {
                    return nodeEach.each(testArray, asyncCallback, options).then(function(debug) {
                        if (testArray.length) {
                            var duration = asyncTime * testArray.length;
                            expect(Math.ceil(debug.duration)).to.be.at.least(duration);
                        } else {
                            expect(debug.duration).to.be.below(5);
                        }
                    });
                });

                it('should have iterations property equal to array length', function() {
                    return nodeEach.each(testArray, asyncCallback, options).then(function(debug) {
                        expect(debug).to.have.property('iterations', testArray.length);
                    });
                });

                it('should have loops property at least asyncTime multiplied by array length and divided by when', function() {
                    var loops = (asyncTime * testArray.length) / options.when;

                    return nodeEach.each(testArray, asyncCallback, options).then(function(debug) {
                        if (testArray.length) {
                            expect(debug.loops).to.at.least(loops);
                        } else {
                            expect(debug).to.have.property('loops', 1);
                        }
                    });
                });

                it('should have on property equal to options.on', function() {
                    return nodeEach.each(testArray, asyncCallback, options).then(function(debug) {
                        expect(debug).to.have.property('on', options.on);
                    });
                });

                it('should have when property equal to options.when', function() {
                    return nodeEach.each(testArray, asyncCallback, options).then(function(debug) {
                        expect(debug).to.have.property('when', options.when);
                    });
                });
            });
        });

    });

    /**
     * Stats Object tests
     * */
    describe('stats', function() {

        it('should be an object', function() {
            expect(nodeEach.stats).to.be.a('object');
        });

        it('should have executing property of number type equal to 0', function() {
            expect(nodeEach.stats).to.have.property('executing', 0);
        });

        it('should have executing property equal to 1 during iterations and 0 on promise resolve', function() {
            function callback() {
                expect(nodeEach.stats).to.have.property('executing', 1);
            }

            nodeEach.each(testArray, callback).then(function() {
                expect(nodeEach.stats).to.have.property('executing', 0);
            });
        });

    });

});