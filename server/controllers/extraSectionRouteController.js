import ExtraSection from '../models/extraSection.js';

export const getExtraSection = async (req, res) => {
  try {
    const data = await ExtraSection.findById('66ddcabb75f0e0b05c7aef38');
    // const data = await ExtraSection.findById('66ca261a292762cc6d825692');
    res.send(data)
  } catch (error) {
    console.log(error)
  }
}

export const createExtraSection = async (req, res) => {
  try {
    // Extract data from the request body
    const {
      sectionWeb1,
      sectionMobile1,
      type1,
      name1,
      sectionWeb2,
      sectionMobile2,
      type2,
      name2,
      sectionWeb3,
      sectionMobile3,
      type3,
      name3
    } = req.body;

    // Create a new document with the extracted data
    const newDocument = new ExtraSection({
      sectionWeb1,
      sectionMobile1,
      type1,
      name1,
      sectionWeb2,
      sectionMobile2,
      type2,
      name2,
      sectionWeb3,
      sectionMobile3,
      type3,
      name3
    });

    // Save the document to the database
    const savedDocument = await newDocument.save();

    // Send a success response
    res.status(201).json(savedDocument);
  } catch (error) {
    console.error('Error creating document:', error);
    res.status(500).json({ message: 'Failed to create document', error });
  }
}

export const update = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  console.log(updates);


  try {
    const extraSection = await ExtraSection.findByIdAndUpdate(id, updates, { new: true });
    if (!extraSection) {
      return res.status(404).send({ message: 'ExtraSection not found' });
    }
    res.send(extraSection);
  } catch (error) {
    res.status(500).send({ message: 'Error updating ExtraSection', error });
  }
}


