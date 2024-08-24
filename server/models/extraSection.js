import mongoose from 'mongoose';

const ExtraSectionSchema = new mongoose.Schema({
  sectionWeb1: { type: Boolean, default: true },
  sectionMobile1: { type: Boolean, default: true },
  type1:{type:String,default:''},
  name1:{type:String, default:''},
  sectionWeb2: { type: Boolean, default: true },
  sectionMobile2: { type: Boolean, default: true },
  type2:{type:String,default:''},
  name2:{type:String, default:''},
  sectionWeb3: { type: Boolean, default: true },
  sectionMobile3: { type: Boolean, default: true },
  type3:{type:String,default:''},
  name3:{type:String, default:''},
});

const ExtraSection = mongoose.model('ExtraSection', ExtraSectionSchema);
export default ExtraSection;
