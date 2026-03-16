import { SystemSettings } from '../models/SystemSettings.js';

const success = (res, message, data = {}, status = 200) => res.status(status).json({ success: true, message, data });

const SETTINGS_ID = 'singleton-settings-id';

export const getSettings = async (req, res, next) => {
  try {
    let settings = await SystemSettings.findById(SETTINGS_ID);
    if (!settings) {
      settings = await SystemSettings.create({ _id: SETTINGS_ID });
    }
    return success(res, 'Settings fetched', { settings });
  } catch (err) {
    next(err);
  }
};

export const updateSettings = async (req, res, next) => {
  try {
    const payload = { ...req.body };
    delete payload._id;
    let settings = await SystemSettings.findById(SETTINGS_ID);
    if (!settings) {
      settings = await SystemSettings.create({ _id: SETTINGS_ID });
    }
    Object.assign(settings, payload);
    await settings.save();
    return success(res, 'Settings updated', { settings });
  } catch (err) {
    next(err);
  }
};
