// at some point, it may make sense to use specific files for music and for sound effects

import Listed from "../baseTypes/listed";
import { Defer } from "../loop.mjs";

// TODO: configure via implementing Game
const ROOT_AUDIO_PATH = "audio/";
const DEFAULT_EXTENSION = ".mp3";

export default class GameSound extends Listed {

    private static _soundBank: Record<string, GameSound> = {};

    // probably delete this
    private static _getSound(name: string) {    
        if (!(name in GameSound._soundBank)) {
            // TODO: these 'audio' should probably actually be sources, with one master audio
            const gameSound = GameSound._soundBank[name];
            gameSound._sound = new Audio(gameSound._fileName);
        }
    
        return GameSound._soundBank[name];
    }

    private _fileName: string;
    private _sound: HTMLAudioElement;
    set volume(volume: number) {
        if(volume < 0) volume = 0;
        else while(volume > 1) {
            volume /= 10;
        }

        this._sound.volume = volume;
    }

    constructor(name: string, fileName?: string) {
        super({name});

        this._fileName = this.resolveFileName(name, fileName);

        Defer(this._loadSound.bind(this), 0);
    }

    private resolveFileName(name: string, fileName?: string) {

        if(!fileName) fileName = name;

        if (!fileName.startsWith(ROOT_AUDIO_PATH)) {
            fileName = ROOT_AUDIO_PATH + fileName;
        }
        if (!fileName.includes('.')) {
            fileName += DEFAULT_EXTENSION;
        }

        return fileName;
    }

    private _loadSound() {
        this._sound = new Audio(this._fileName);
        this.Play(0);
        this.volume = 1;
    }

    Play(volume?: number) {
        if(volume) this.volume = volume;

        // we may need to have a more robust way of checking
        // if the file is properly loaded before playing it
        if(this._sound.readyState > 0) {
            try {
                // console.log(`Playing sound ${sound.src} for ${this.name} at ${sound.volume}`);
                this._sound.play();
            } catch(ex) {
                console.warn(ex);
            } 
        } else {
            console.warn(`Sound ${this._sound.src} not ready for ${this.name}. 
                State: ${this._sound.readyState}`, this._sound);
        }
    }
}

import './AudioSetup';
