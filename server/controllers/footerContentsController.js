import FooterContent from "../models/footerContents.js";

export const createOrUpdateFooterContent = async (req, res) => {
    try {
      const { aboutUs, privacyPolicy, termsConditions, returnPolicy } = req.body;
  
      let content = await FooterContent.findOne();
  
      if (content) {
        // Update existing content
        content.aboutUs = aboutUs;
        content.privacyPolicy = privacyPolicy;
        content.termsConditions = termsConditions;
        content.returnPolicy = returnPolicy;
      } else {
        // Create new content
        content = new FooterContent({
          aboutUs,
          privacyPolicy,
          termsConditions,
          returnPolicy,
        });
      }
  
      await content.save();
      res.status(200).json({ message: "Footer content saved successfully!", content });
    } catch (error) {
      console.error("Error updating footer content:", error);
      res.status(500).json({ error: "Failed to update footer contents" });
    }
  };

export const getFooterContent = async (req, res) => {
    try {
      const content = await FooterContent.findOne();
      if (!content) {
        return res.status(404).json({ message: "No footer content found" });
      }
      res.status(200).json(content);
    } catch (error) {
      console.error("Error fetching footer content:", error);
      res.status(500).json({ error: "Failed to fetch footer contents" });
    }
  };