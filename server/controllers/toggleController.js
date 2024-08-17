import ToggleState from '../models/toggleState.js';

// Get the toggle states
export const getToggleStates = async (req, res) => {
  try {
    const toggleState = await ToggleState.findOne();
    res.json(toggleState || {});
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
};

// Update the toggle states
export const updateToggleStates = async (req, res) => {
  try {
    let toggleState = await ToggleState.findOne();
    
    if (!toggleState) {
      toggleState = new ToggleState(req.body);
    } else {
      Object.assign(toggleState, req.body);
    }

    await toggleState.save();
    res.json({ message: 'Toggle states updated successfully', toggleState });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
};
