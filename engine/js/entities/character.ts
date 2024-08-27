import Tooltip from '../ui/tooltip';
import SentientEntity from './character/SentientEntity';

export default class Character extends SentientEntity {

    // TODO: this should probably go to 'playable', but let's make that change separately
    toolTip: Tooltip;
    controller: any; // inputdevice
    
    additionalClasses: string;

    constructor(options: any = {}) {
        super(options);

        if(options.research) {
            console.log('TODO: research not supported right now');
        }

        if(options.additionalClasses) this.additionalClasses = options.additionalClasses;
    }
}

if(window) window.Character = Character;
