import PostConstruct from "../../../../ts/decorators/PostConstruct";
import WorldCoordinate from "../../../coordinates/WorldCoordinate";
import Events from "../../../events";
import Character from "../../character";
import Entity, { CharacterFilterOptions } from "../Entity";
import { Combative } from "./Combative";

Events.List.PlayerChunkChanged = "PlayerChunkChanged";
Events.List.PlayerMoved = "PlayerMoved";

export interface Playable {
    isPlayer: boolean;
}

export interface PlayableOptions {
    isPlayer?: boolean;
}

// TODO: reduce to Entity?
let _LOCAL_PLAYER: Character & Playable & Combative;

export function GetLocalPlayer(): Entity {
    return _LOCAL_PLAYER;
}

let playableClass: any;

type Constructor<T = {}> = new (...args: any[]) => T;
export function MakePlayable<T extends Constructor<Entity>>(Base: T, playableOptions: PlayableOptions)
    : T & Constructor<Playable>  {
        if(!playableClass) {
            playableClass = class PlayableClass extends Base implements Playable {

                static get LOCAL_PLAYER() {
                    return _LOCAL_PLAYER;
                }
        
                static set LOCAL_PLAYER(value) {
                    _LOCAL_PLAYER = value;
                }
        
                static {
                    PostConstruct(PlayableClass, PlayableClass.prototype.initialize);
                }
        
                isPlayer: boolean;
                private _lastPosition: Readonly<WorldCoordinate> = null;
                
                // since we can't do (postconstructor) decorator, 
                constructor(...args: any) {
                    super(...args);
        
                    if(this.position) this._lastPosition = new WorldCoordinate(this.position.x, this.position.y);
        
                    // PostConstruct(this, 'initialize');
                }
        
                initialize(): void {
        
                    this.isPlayer = playableOptions?.isPlayer || false;
        
                    if(this.isPlayer) {
                        if(_LOCAL_PLAYER) console.warn(`Setting the local player when one is already set.`);
                        _LOCAL_PLAYER = this as unknown as Character & Playable & Combative;
                    }
                }
        
                move(amount: number) {
                    super.move(amount);
        
                    this.afterMove();
                }
                    
                afterMove() {
                    // TODO: We can probly extract to a callback (#positionUpdated)
                    // and call from within the position setter (in Entity)
                    if(!this.position.equals(this._lastPosition)) {
                        if(this.isPlayer) {
                            Events.RaiseEvent(Events.List.PlayerMoved, {
                                character: this,
                                from: this._lastPosition,
                                to: this.position
                                }, {
                                isNetworkBoundEvent: true
                            });
                            
                            if(!this.position.chunk.equals(this._lastPosition?.chunk)) {
                                Events.RaiseEvent(Events.List.PlayerChunkChanged, {
                                    character: this,
                                    from: this._lastPosition?.chunk,
                                    to: this.position.chunk
                                }, {
                                    isNetworkBoundEvent: true
                                });
                            }
                        }
                    }
        
                    if(this._lastPosition == null) { 
                        this._lastPosition = new WorldCoordinate(this.position.x, this.position.y);
                    }
                    else if(!this.position.equals(this._lastPosition)) {
                        this._lastPosition.update(this.position);
                    }
                }
                
                shouldFilterCharacter(character: Entity & Playable, options: CharacterFilterOptions & PlayableOptions) {
        
                    if (options.isPlayer != null && character.isPlayer != options.isPlayer) {
                        return true;
                    }
                    
                    return super.shouldFilterCharacter(character, options);
                }
            }
        }
    return playableClass;
}

export function IsPlayable(obj: Entity): obj is Entity & Playable {
    const playable = obj as unknown as Playable;
    return playable 
        && playable.isPlayer !== undefined
        && playable.isPlayer != null;
}
