const ReduceableFateCost = require('./ReduceableFateCost');
const Event = require('../Events/Event');
const { EventNames } = require('../Constants');

class TargetDependentFateCost extends ReduceableFateCost {
    constructor(targetName, ignoreType) {
        super(ignoreType);
        this.dependsOn = targetName;
    }

    canPay(context) {
        if(context.source.printedCost === null) {
            return false;
        }
        if(!context.targets[this.dependsOn]) {
            // we don't need to check now because this will be checked again once targeting is done
            return true;
        }
        let reducedCost = context.player.getMinimumCost(context.playType, context, context.targets[this.dependsOn], this.ignoreType);
        return context.player.fate >= reducedCost && (reducedCost === 0 || context.player.checkRestrictions('spendFate', context));
    }

    getReducedCost(context) {
        return context.player.getReducedCost(context.playType, context.source, context.targets[this.dependsOn], this.ignoreType);
    }

    payEvent(context) {
        const amount = context.costs.targetDependentFate = this.getReducedCost(context);
        return new Event(EventNames.OnSpendFate, { amount, context }, event => {
            event.context.player.markUsedReducers(context.playType, event.context.source, event.context.targets[this.dependsOn]);
            event.context.player.fate -= this.getFinalFatecost(context, amount);
        });
    }
}

module.exports = TargetDependentFateCost;
