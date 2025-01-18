import mongoose from 'mongoose';

const ExtraSectionSchema = new mongoose.Schema({
  sectionWeb1: { type: Boolean, default: true },
  sectionMobile1: { type: Boolean, default: true },
  type1: { type: String, default: '' },
  name1: { type: String, default: '' },
  id1: { type: mongoose.Schema.Types.ObjectId, default: null }, // Plain ObjectId for section 1

  sectionWeb2: { type: Boolean, default: true },
  sectionMobile2: { type: Boolean, default: true },
  type2: { type: String, default: '' },
  name2: { type: String, default: '' },
  id2: { type: mongoose.Schema.Types.ObjectId, default: null }, // Plain ObjectId for section 2

  sectionWeb3: { type: Boolean, default: true },
  sectionMobile3: { type: Boolean, default: true },
  type3: { type: String, default: '' },
  name3: { type: String, default: '' },
  id3: { type: mongoose.Schema.Types.ObjectId, default: null }, // Plain ObjectId for section 3

  sectionWeb4: { type: Boolean, default: true },
  sectionMobile4: { type: Boolean, default: true },
  type4: { type: String, default: '' },
  name4: { type: String, default: '' },
  id4: { type: mongoose.Schema.Types.ObjectId, default: null }, // Plain ObjectId for section 4

  sectionWeb5: { type: Boolean, default: true },
  sectionMobile5: { type: Boolean, default: true },
  type5: { type: String, default: '' },
  name5: { type: String, default: '' },
  id5: { type: mongoose.Schema.Types.ObjectId, default: null }, // Plain ObjectId for section 5

  sectionWeb6: { type: Boolean, default: true },
  sectionMobile6: { type: Boolean, default: true },
  type6: { type: String, default: '' },
  name6: { type: String, default: '' },
  id6: { type: mongoose.Schema.Types.ObjectId, default: null }, // Plain ObjectId for section 6

  sectionWeb7: { type: Boolean, default: true },
  sectionMobile7: { type: Boolean, default: true },
  type7: { type: String, default: '' },
  name7: { type: String, default: '' },
  id7: { type: mongoose.Schema.Types.ObjectId, default: null }, // Plain ObjectId for section 7
});

const ExtraSection = mongoose.model('ExtraSection', ExtraSectionSchema);
export default ExtraSection;
