'use strict';

/**
 * LPD.game
 * this class takes care of all the game logic
 *
 * @constructor
 */
LPD.Game = function () {

    // set ups
    this.score       = 501;
    this.gameDarts   = 0;

    // a score count for the three darts you are throwing
    this.okiScore    = [];

    // create scores array and populate with available scores
    this.scores = [];

    this.scores.push(25);
    for (var i = 20; i > 0; i -= 1) {
        this.scores.push(i);
    }

    // reset checkout - display message that one isn't ready yet
    this.resetCheckout();

    // listen to events
    _.listen('dart:thrown', this.registerScore.bind(this));
};


// extend the prototype
_.extend(LPD.Game.prototype, {


    /**
     * resetCheckout
     */
    resetCheckout: function () {
        _.$('checkout').innerHTML = 'Checkout will appear here when available';
    },

    /**
     * registerScore
     * callback from event register, accepts the score that has been thrown and
     * increases the dart throw count.
     *
     * @param score
     */
    registerScore: function (score) {

        var dartsThrown;

        // if three have been thrown, reset array
        if (this.okiScore.length === 3) {
            this.resetOki();
        }

        // register score
        this.okiScore.push(score);

        dartsThrown = (3 - this.okiScore.length) || 3;

        // amend counters
        this.score -= score;
        this.gameDarts += 1;

        if (this.score < 0) {
            // bust, go back to start of three dart throw
            this.lastOkiScore();

        } else if (this.score <= 170) {
            // check for finish
            this.checkForFinish(null, dartsThrown);
        }

        // update board
        this.updateDOM();
    },


    /**
     * resetOki
     * resets the score for this set of darts
     */
    resetOki: function () {

        this.okiScore.length = 0;
        _.$('.toThrow').className = 'toThrow';
    },


    /**
     * updateDOM
     * method to separate the dom manipulation, simply prints the stored values
     * to the DOM
     */
    updateDOM: function () {

        _.$('score').innerHTML = this.score;
        _.$('darts').innerHTML = this.gameDarts;
        _.$('dScore').innerHTML = this.getOkiScore();
        _.$('.toThrow').className += ' throw' + this.okiScore.length;
    },


    /**
     * getOkiScore
     * returns the current oki score
     * @returns {Number}
     */
    getOkiScore: function () {

        if (this.okiScore.length) {
            return this.okiScore.reduce(function (memory, number) {
                return (+memory) + (+number);
            });
        } else {
            return 0;
        }
    },


    /**
     * lastOkiScore
     * if the user has gone bust then, we re-calc the previous score
     */
    lastOkiScore: function () {

        this.score = this.score + this.getOkiScore();

        this.resetOki();
    },


    /**
     * checkForFinish
     * main method for resolving the checkout score based on dart left to throw
     */
    checkForFinish: function (score, dartsLeft) {

        score = score || this.score;

        var accumulative = score,
            darts = 0,
            len = this.scores.length,
            i,
            j,
            k,
            checkouts = [],
            possibles = [];


        switch (dartsLeft) {

            case 1:
                // one dart left, check for a single double
                this.scores.forEach(function (value) {

                    if (score - (value * 2) === 0) {
                        if (value === 25) {
                            checkouts.push(['BULL']);
                        } else {
                            checkouts.push(['D' + value]);
                        }
                    }
                });

                break;

            case 2:
                // two darts, attempt single double, then add single then add
                // treble

                var temp = [],
                    item;

                // get doubles available
                this.scores.forEach(function (value) {

                    accumulative = score - (value * 2);

                    // we have a double finish straight away
                    if (accumulative === 0) {
                        if (value === 25) {
                            checkouts.push(['BULL']);
                        } else {
                            checkouts.push(['D' + value]);
                        }
                    } else if (score - (value * 2) > 2) {
                        item = {};
                        item[value] = 2;
                        temp.push(item);
                    }
                });

                console.log(temp);

                break;


            case 3:

                break;
        }

        for (i = 0; i < len; i += 1) {

            // resets
            accumulative = score;
            darts = 0;

            // first lets check all doubles
            accumulative -= (this.scores[i] * 2);

            // straight double finish jump out now
            if (accumulative === 0) {
                //// accommodate `bull`
                //if (this.scores[i] === 25) {
                //    checkouts.push(['BULL']);
                //} else {
                //    checkouts.push(['D' + this.scores[i]]);
                //}
                //
                i = len;

            } else {


                possibles.push(this.scores[i]);

                //for (j = 0; j < len; j += 1) {
                //
                //    if (accumulative - (this.scores[j] * 2) === 0) {
                //        // another double
                //        if (this.scores[i] === 25) {
                //            checkouts.unshift(['D' + this.scores[j], 'BULL']);
                //        } else {
                //            checkouts.unshift(['D' + this.scores[j], 'D' + this.scores[i]]);
                //        }
                //
                //    } else if (accumulative - (this.scores[j] * 3) === 0) {
                //        // a single treble does it
                //        if (this.scores[i] === 25) {
                //            checkouts.unshift(['T' + this.scores[j], 'BULL']);
                //        } else {
                //            checkouts.unshift(['T' + this.scores[j], 'D' + this.scores[i]]);
                //        }
                //
                //    } else if (accumulative - (this.scores[j] * 4) === 0) {
                //        // lets try x2 doubles
                //        if (this.scores[i] === 25) {
                //            checkouts.unshift(['D' + this.scores[j], 'D' + this.scores[j], 'BULL']);
                //        } else {
                //            checkouts.unshift(['D' + this.scores[j], 'D' + this.scores[j], 'D' + this.scores[i]]);
                //        }
                //
                //    } else if (accumulative - (this.scores[j] * 5) === 0) {
                //        // single double and a single treble
                //        if (this.scores[i] === 25) {
                //            checkouts.unshift(['T' + this.scores[j], 'D' + this.scores[j], 'BULL']);
                //        } else {
                //            checkouts.unshift(['T' + this.scores[j], 'D' + this.scores[j], 'D' + this.scores[i]]);
                //        }
                //
                //    } else if (accumulative - (this.scores[j] * 6) === 0) {
                //        // lets try x2 trebles
                //        if (this.scores[i] === 25) {
                //            checkouts.unshift(['T' + this.scores[j], 'T' + this.scores[j], 'BULL']);
                //        } else {
                //            checkouts.unshift(['T' + this.scores[j], 'T' + this.scores[j], 'D' + this.scores[i]]);
                //        }
                //    }
                //}

            }
        }

        // lets sort and trim the results
        checkouts.sort(function (checkoutA, checkoutB) {

            if (checkoutA.length < checkoutB.length) {
                return -1;
            }

            return 1;
        });

        // filter to only checkouts available with darts left
        checkouts = checkouts.filter(function (array) {
            return array.length <= dartsLeft;
        });

        // log results
        this.printResults(checkouts);
    },


    /**
     * printResults
     * updates the DOM with all possible finishes
     *
     * @param checkouts
     */
    printResults: function (checkouts) {

        var unOrderedList = document.createElement('ul'),
            listItem;

        checkouts.forEach(function (array) {

            listItem = document.createElement('li');

            listItem.innerHTML = array.join(', ');
            unOrderedList.appendChild(listItem);
        });

        unOrderedList.className = 'checkouts';

        _.$('checkout').innerHTML = '';
        _.$('checkout').appendChild(unOrderedList);
    }
});