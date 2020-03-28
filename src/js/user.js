App = {
  web3Provider: null,
  contracts: {},

  init: function() {
    return App.initWeb3();
  },

  initWeb3: async function() {            //初始化web3
    if (window.ethereum) {
    App.web3Provider = window.ethereum;
    try {
      // 请求用户授权
      await window.ethereum.enable();
    } catch (error) {
      // 用户不授权时
      console.error("User denied account access")
    }
  } else if (window.web3) {   // 老版 MetaMask Legacy dapp browsers...
    App.web3Provider = window.web3.currentProvider;
  } else {
    App.web3Provider = new Web3.providers.HttpProvider('http://127.0.0.1:7545');
  }
  web3 = new Web3(App.web3Provider);//web3js就是你需要的web3实例
 
  web3.eth.getAccounts(function (error, result) {
    if (!error)
      console.log(result)//授权成功后result能正常获取到账号了
  });

    return App.initContract();
  },

  initContract: function() {        //初始化合约
    $.getJSON('User.json', function(data) {   //为何可直接加载Adoption.json文件呢，这是因为./build/contracts目录亿配置到服务器的环境中
      var UserEvent = data;
      App.contracts.User = TruffleContract(UserEvent);
      App.contracts.User.setProvider(App.web3Provider);
    });

    return App.bindEvents();
  },

  bindEvents: function() {          //绑定事件
    $(document).on('click', '.register', App.commitInfo);     //btn-adopt是index.html,当这个按钮被点击时调用App的handleAdopt方法
  },

  commitInfo: function(event) {
    event.preventDefault();
    var registerInstance;
    var username = document.getElementById("username").value;
    console.log(username)

    web3.eth.getAccounts(function(error, accounts){       //拿到当前环境下的账号
      var account = accounts[0];      //取第一个账号
      console.log(account)

      App.contracts.User.deployed().then(function(instance){
        registerInstance = instance;

        return registerInstance.createUser(account, username);
      } ).catch(function(err) {
        console.log(err.message);
      });
    });
  }
};

$(function() {
  $(window).load(function() {       //当window被加载时，会调用App.init
    App.init();
  });
});