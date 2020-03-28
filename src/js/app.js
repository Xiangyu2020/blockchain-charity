App = {
  web3Provider: null,
  contracts: {},

  init: function() {
    // Load pets.
    $.getJSON('../pets.json', function(data) {
      var petsRow = $('#petsRow');
      var petTemplate = $('#petTemplate');

      //把一个个pet对象赋值到模板对应的标签上去
      for (i = 0; i < data.length; i ++) {
        petTemplate.find('.panel-title').text(data[i].name);
        petTemplate.find('img').attr('src', data[i].picture);
        petTemplate.find('.pet-breed').text(data[i].breed);
        petTemplate.find('.pet-age').text(data[i].age);
        petTemplate.find('.pet-location').text(data[i].location);
        petTemplate.find('.btn-adopt').attr('data-id', data[i].id);

        petsRow.append(petTemplate.html());
      }
    });

    return App.initWeb3();
  },

  initWeb3: async function() {            //初始化web3
    //web3初始化过程参考：https://github.com/ethereum/web3.js
       //在初始化web3时，要先判断当前环境中是否已经有web3，没有再构建web3。因为在使用metamask时，会自带web3.
    /*
    if (typeof web3 !== 'undefined') {
      App.web3Provider = web3.currentProvider;
    } else {
      App.web3Provider = new Web3.prviders.HttpProvider("http://127.0.0.1:7545");   //ganache的地址
    }
    web3 = new Web3(App.web3Provider);
    */
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
    $.getJSON('Adoption.json', function(data) {   //为何可直接加载Adoption.json文件呢，这是因为./build/contracts目录亿配置到服务器的环境中
      var AdoptionArtifact = data;

      App.contracts.Adoption = TruffleContract(AdoptionArtifact);
      App.contracts.Adoption.setProvider(App.web3Provider);

      return App.markAdopted();       //标记当前宠物是否被领养
    });

    return App.bindEvents();
  },

  bindEvents: function() {          //绑定事件
    $(document).on('click', '.btn-adopt', App.handleAdopt);     //btn-adopt是index.html,当这个按钮被点击时调用App的handleAdopt方法
  },

  markAdopted: function(adopters, account) {        //标记当前的宠物是否被领养

    var apotionInstance;
    //App.contracts.Adoption.deployed()可以拿到合约的实例，传递给then(function(instance)
    //中的instance。.then(function(instance)是promise的写法，
    App.contracts.Adoption.deployed().then(function(instance) {
      apotionInstance = instance;
      return apotionInstance.getAdopters.call();
    }).then(function(adopters) {            //上一步return apotionInstance.getAdopters.call()的返回值传递给了function(adopters)

      for(i =0; i< adopters.length; i++) {
        //console.log(i)
        console.log(adopters[i]);
        //地址元素默认为0x0000000000000000000000000000000000000000
        if(adopters[i] !== '0x0000000000000000000000000000000000000000') {
          //button的文字写成Success，同时不能被点击
          $('.panel-pet').eq(i).find('button').text('Success').attr('disabled', true);
        }
      }
    }).catch(function(err) {          //捕获异常
      console.log(err.message);
    })
  },

  handleAdopt: function(event) {
    event.preventDefault();
    var apotionInstance;
    var petId = parseInt($(event.target).data('id'));
    //web3.eth.getAccounts();

    web3.eth.getAccounts(function(error, accounts){       //拿到当前环境下的账号
      var account = accounts[0];      //取第一个账号
      //document.write(account)

      App.contracts.Adoption.deployed().then(function(instance){
        apotionInstance = instance;

        return apotionInstance.adopt(petId, {from: account});
      }).then(function(result) {
        return App.markAdopted();       //标记状态
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