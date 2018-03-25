

export default {
  async test({ commit },payload) {
    console.log(payload);
  },

  async startConversation({ commit }, address) {
    var conversation = this.state.conversations.find( c => c.address == address);

    if(conversation != null) {
      this.state.conversations.push({
        adress: address,
        creationOn: Date.now()
      })
    }
  },
  async createHushlist({ commit },name) {
    
  }
};
