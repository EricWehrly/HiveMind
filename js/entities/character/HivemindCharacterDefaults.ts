import { MakeCombative } from "../../../engine/js/entities/character/mixins/Combative";
import { MakeEquipped } from "../../../engine/js/entities/character/mixins/Equipped";
import { MakeLiving } from "../../../engine/js/entities/character/mixins/Living";
import { MakeSentient } from "../../../engine/js/entities/character/mixins/Sentient";
import HivemindCharacterFactory from "./HivemindCharacterFactory";
import { MakeGrowable } from "./mixins/Growable";

HivemindCharacterFactory.SetDefaultMixin(MakeGrowable);
HivemindCharacterFactory.SetDefaultMixin(MakeLiving);
HivemindCharacterFactory.SetDefaultMixin(MakeCombative);
HivemindCharacterFactory.SetDefaultMixin(MakeEquipped);
HivemindCharacterFactory.SetDefaultMixin(MakeSentient);
