pragma solidity ^0.5.0;
contract User {
	// 用户信息
	struct UserStruct {
		address userAddress;
		string userName;
		uint index; // 索引，用于快速检索
	}

	// 用户列表
	struct UserListStruct {
		address userAddress;
		uint index;
	}

	address[] public userAddresses;
	string[] private userNames;

	mapping(address => UserStruct) private add2User;
	mapping(string => UserListStruct) private name2UserList;

	// 查询用户是否合法
	function isExistAddress(address _userAddress) public view returns(bool isExist) {
		if (userAddresses.length == 0) return false; // 系统还没有用户时返回false
		return (userAddresses[add2User[_userAddress].index] == _userAddress);
	}
	function isExistName(string memory _userName) public view returns(bool isExist) {
		if (userNames.length == 0) return false;
		//string memory tmp = userNames[name2UserList[_userName].index];
		return (true);
	}

	// 获取用户地址
	function findAddressByName(string memory _userName) public view returns (address userAddress) {
		require (isExistName(_userName));
		return name2UserList[_userName].userAddress;
	}

	// 创建用户信息
	function createUser(address _userAddress, string memory _userName) public returns (uint index) {
		require(!isExistAddress(_userAddress)); // 避免重复创建
		userAddresses.push(_userAddress);
		add2User[_userAddress] = UserStruct(_userAddress, _userName, userAddresses.length - 1);
		userNames.push(_userName);
		name2UserList[_userName] = UserListStruct(_userAddress, userNames.length - 1);
		return userAddresses.length - 1;
	}

	// 获取用户信息
	function findUser(address _userAddress) public view returns (address userAddress, string memory userName, uint index) {
		require(isExistAddress(_userAddress));
		return (add2User[_userAddress].userAddress,
				add2User[_userAddress].userName,
				add2User[_userAddress].index);
	}
}