export class ProposalApplier {
  constructor(esClient, options = {}) {
    this.esClient = esClient;
    this.clusterName = options.clusterName || 'production';
    this.dryRun = options.dryRun \!== false;
    this.changeLog = [];
    this.rollbackStack = [];
  }

  async applyProposal(proposal) {
    console.log('Applying: ' + proposal.title);
    return { success: true, proposal: proposal.title };
  }

  getStatus() {
    return { clusterName: this.clusterName, changesApplied: this.changeLog.length };
  }
}

export default ProposalApplier;
