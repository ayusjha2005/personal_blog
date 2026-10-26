const Profile = require('../models/Profile');

class ProfileService {
  async getProfile() {
    let profile = await Profile.findOne().lean();
    if (!profile) {
      profile = await Profile.create({});
      return profile.toObject();
    }
    return profile;
  }

  async updateProfile(data) {
    let profile = await Profile.findOne();
    if (!profile) {
      profile = new Profile(data);
    } else {
      Object.assign(profile, data);
    }
    return profile.save();
  }
}

module.exports = new ProfileService();
