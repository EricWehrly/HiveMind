import { MakeCombative } from "../../../engine/js/entities/character/mixins/Combative";
import { MakeEquipped } from "../../../engine/js/entities/character/mixins/Equipped";
import { MakeLiving } from "../../../engine/js/entities/character/mixins/Living";
import { MakeSentient } from "../../../engine/js/entities/character/mixins/Sentient";
import { HiveMindCharacterFactory } from "./HivemindCharacterFactory";
import { MakeGrowable } from "./mixins/Growable";

HiveMindCharacterFactory.SetDefaultMixin(MakeGrowable);
HiveMindCharacterFactory.SetDefaultMixin(MakeLiving);
HiveMindCharacterFactory.SetDefaultMixin(MakeCombative);
HiveMindCharacterFactory.SetDefaultMixin(MakeEquipped);
HiveMindCharacterFactory.SetDefaultMixin(MakeSentient);
