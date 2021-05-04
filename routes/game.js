/* 
game.js
@author: Kate Erkan
version: April 2021
Description: Contains all class functions to run an instance of a Hangman game.
*/ 

"use strict";
//const { forEach } = require('mathjs');



//Creates and manage a Hangman class/game
const Hangman = (function () {
    class Hangman {
        constructor(word, attempts = 6) {
            
            if (typeof word !== "string") throw Error("invalid word " + word)

            this._word = word.trim()

            if (!this._word.length) throw Error("word cannot empty or blank")

            this._attempts = attempts

            if (typeof this._attempts !== "number") throw Error("invalid attempts " + this._attempts)

            if (this._attempts <= 0) throw Error("invalid number of attempts " + this._attempts)

            this._guessed = new Array(this._word.length).fill("_")

            this._status = Hangman.CONTINUE

            this._fails = []
        }

        // Returns the word to guess 
        hidden(){
            if (this._status === Hangman.LOSE) return this._word.split("")
            return 
        }

        //Returns an array of the word with hidden ("_") and showed letters
         guessed() {
            return this._guessed
        }

        //Returns remaining attempts
        attempts() {
            return this._attempts
        }

        //Returns game status
        status() {
            return this._status
        }

        /**
         * If params empty returns the failed letters, else push new letter to a failed array
         * 
         * @param {String} str letter that is not in the word to guess
         * 
         * @returns {String}
         * 
         * @throws {Error} if param is not a string
         */
        fails(str) {
            if (str !== undefined && typeof str !== "string") throw Error("invalid input")
            if (str) {
                this._fails.push(str.toUpperCase())
            } else {
                return `${this._fails.join(" ")} `
            }
        }

        /**
         * Checks if param is word or letter and return if match
         * 
         * @param {String} text letter or word
         * 
         * @returns {Boolean} 
         * 
         * @throws {Error} if param is not string or is an emplty one
         */
        try(text) {
            if (typeof text !== "string") throw Error("invalid character or word " + text);
            
            text = text.toLowerCase().trim();
            if (!text.length) throw Error("text cannot be empty or blank");

            if (this._status === Hangman.CONTINUE && this._attempts > 0){
                return text.length === 1 ? tryLetter(this, text) : tryWord(this, text);
            }else{
                return false;
            }
        }//Edited by Ryan

        // Get the status of current game
         
        static get CONTINUE() { return 0 }

        static get WIN() { return 1 }

        static get LOSE() { return 2 }
    }

    /**
     * Checks if the letter is founded and updates status (if is not founded also updates fails and attempts)
     * 
     * @param {Hangman} inst instance of hangman
     * @param {String} text letter
     * 
     * @returns {Boolean} 
     */
    function tryLetter(inst, letter) {
        const index = (inst._word).indexOf(letter)

        let match = false

        if (index > -1) {
            for (let i = index; i < inst._word.length; i++) {
                const char = inst._word[i]

                if (char === letter) {
                    inst._guessed[i] = char
                }
            }

            match = true
        } else {
            inst.fails(letter)
            inst._attempts--
        }

        update(inst)

        return match
    }

    /**
     * Checks if the word is the word to guess and updates the status 
     * 
     * @param {Hangman} inst instance of hangman
     * @param {String} word word to try
     * 
     * @returns {Boolean} 
     */
    function tryWord(inst, word) {
        let match = false

        if (word === inst._word) {
            for (var i = 0; i < inst._word.length; i++)
                inst._guessed[i] = inst._word[i]

            match = true
        } else inst._attempts = 0

        update(inst)

        return match
    }

    // Checks and modifies the game status
    function update(inst) {
        if (!inst._attempts)
            inst._status = Hangman.LOSE
        else if (inst._guessed.indexOf("_") === -1)
            inst._status = Hangman.WIN
        else
            inst._status = Hangman.CONTINUE
    }

    return Hangman
})()
//let wordsArray =["cat", "dog", "bird", "horse"];

module.exports = Hangman