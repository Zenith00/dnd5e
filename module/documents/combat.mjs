/**
 * Override the default Initiative formula to customize special behaviors of the system.
 * Apply advantage, proficiency, or bonuses where appropriate
 * Apply the dexterity score as a decimal tiebreaker if requested
 * See Combat._getInitiativeFormula for more detail.
 * @returns {string}  Final initiative formula for the actor.
 */
export function _getInitiativeFormula() {
  const actor = this.actor;
  if ( !actor ) return "1d20";
  const init = actor.system.attributes.init;
  const rollData = actor.getRollData();
  let diceBase = game.settings.get("dnd5e", "initiativeDice");

  // Construct initiative formula parts
  let nd = 1;
  let mods = "";
  if ( actor.getFlag("dnd5e", "halflingLucky") ) mods += "r1=1";
  if ( actor.getFlag("dnd5e", "initiativeAdv") ) {
    nd = 2;
    mods += "kh";
  }
  const parts = [
    `${nd}d${diceBase}${mods}`,
    init.mod,
    (init.prof.term !== "0") ? init.prof.term : null,
    (init.bonus !== 0) ? init.bonus : null
  ];

  // Ability Check Bonuses
  const dexCheckBonus = actor.system.abilities.dex?.bonuses?.check;
  const globalCheckBonus = actor.system.bonuses?.abilities?.check;
  if ( dexCheckBonus ) parts.push(Roll.replaceFormulaData(dexCheckBonus, rollData));
  if ( globalCheckBonus ) parts.push(Roll.replaceFormulaData(globalCheckBonus, rollData));

  // Optionally apply Dexterity tiebreaker
  const tiebreaker = game.settings.get("dnd5e", "initiativeDexTiebreaker");
  if ( tiebreaker ) parts.push((actor.system.abilities.dex?.value ?? 0) / 100);
  return parts.filter(p => p !== null).join(" + ");
}
