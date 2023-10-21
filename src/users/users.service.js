const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const addUser =
  (User) =>
  ({ email, billingID, plan, endDate }) => {
    if (!email || !billingID || !plan) {
      throw new Error(
        "Missing Data. Please provide values for email, billingID, plan"
      );
    }

    const user = new User({ email, billingID, plan, endDate });
    return user.save();
  };

const registerUser =
  (User) =>
  async ({
    firstName,
    lastName,
    email,
    username,
    password,
    billingID,
    plan,
    endDate,
    phoneNumber,
    role,
  }) => {
    const userAlreadyExists = await User.findOne({ email });

    if (userAlreadyExists) {
      return {
        status: "error",
        message: "There is already a user with this email address!",
      };
    }

    const user = new User({
      firstName,
      lastName,
      email,
      username,
      password,
      billingID,
      plan,
      endDate,
      phoneNumber,
      role: role ? role : "user",
    });
    user.hash = bcrypt.hashSync(password, 10);

    return user.save();
  };

const getUsers = (User) => () => {
  return User.find({});
};

const getById = (User) => async (id) => {
  return await User.findById(id);
};

const getUserByEmail = (User) => async (email) => {
  return await User.findOne({ email });
};

const getUserByBillingID = (User) => async (billingID) => {
  return await User.findOne({ billingID });
};

const updateProfile = (User) => async (email, update, password) => {
  let updateObj;

  if (password) {
    updateObj = {
      ...update,
      hash: bcrypt.hashSync(password, 10),
    };
  } else {
    updateObj = update;
  }
  return await User.findOneAndUpdate({ email }, updateObj);
};

const authenticate = (User) => async (email, password) => {
  const user = await User.findOne({ email });
  if (user && bcrypt.compareSync(password, user.hash)) {
    const token = jwt.sign({ sub: user.id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    return {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      hasTrial: user.hasTrial,
      plan: user.plan,
      customerID: user.billingID,
      token,
      role: user.role,
      survey: user.survey,
    };
  }
};

const getAll = (User) => async () => {
  return await User.find();
};

const _delete = (User) => async (id) => {
  await User.findByIdAndRemove(id);
};

module.exports = (User) => {
  return {
    addUser: addUser(User),
    getUsers: getUsers(User),
    getUserByEmail: getUserByEmail(User),
    getUserByBillingID: getUserByBillingID(User),
    registerUser: registerUser(User),
    authenticate: authenticate(User),
    getById: getById(User),
    getAll: getAll(User),
    updateProfile: updateProfile(User),
    _delete: _delete(User),
  };
};
