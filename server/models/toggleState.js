import mongoose from 'mongoose';

const ToggleStateSchema = new mongoose.Schema({
  webFeature: { type: Boolean, default: false },
  webArrival: { type: Boolean, default: false },
  webSellingCategory: { type: Boolean, default: false },
  webVideo: { type: Boolean, default: false },
  webProductShowCase: { type: Boolean, default: false },
  webNewsLetter: { type: Boolean, default: false },
  webBestDeal: { type: Boolean, default: false },
  mobileFeature: { type: Boolean, default: false },
  mobileArrival: { type: Boolean, default: false },
  mobileSellingCategory: { type: Boolean, default: false },
  mobileVideo: { type: Boolean, default: false },
  mobileProductShowCase: { type: Boolean, default: false },
  mobileNewsLetter: { type: Boolean, default: false },
  mobileBestDeal: { type: Boolean, default: false },
});

const ToggleState = mongoose.model('ToggleState', ToggleStateSchema);
export default ToggleState;
