class UserModel {
  String key;
  String username;
  bool enabled;
  bool canListUsers;
  bool isAdministrator;
  bool isCustomer;
  String name;
  String lastName;

  UserModel(
    this.key,
    this.username,
    this.enabled,
    this.canListUsers,
    this.isAdministrator,
    this.isCustomer,
    this.name,
    this.lastName,
  );

  factory UserModel.fromJSON(String key, dynamic jsonData) {
    return UserModel(
      key,
      jsonData['username'] as String,
      jsonData['enabled'] as bool,
      jsonData['canListUsers'] as bool,
      jsonData['isAdministrator'] as bool,
      jsonData['isCustomer'] as bool,
      jsonData['name'] != null ? jsonData['name'] as String : "",
      jsonData['lastName'] != null ? jsonData['lastName'] as String : "",
    );
  }

  Map<String, dynamic> toJson() => {
        'username': username,
        'enabled': enabled,
        'canListUsers': canListUsers,
        'isAdministrator': isAdministrator,
        'isCustomer': isCustomer,
        'name': name,
        'lastName': lastName,
      };
}
