import { LightningElement, api, track } from "lwc";
import { FlowAttributeChangeEvent } from "lightning/flowSupport";

export default class CustomFileUploader extends LightningElement {
  @api contentDocumentIDs = [];
  @api flexipageRegionWidth;
  @api formats =
    ".csv, .doc, .docx, .gif, .jpeg, .jpg, .pdf, .png, .rtf, .txt, .word, .xls, .xlsx, .zip";
  @api label = "File Uploader";
  @api multipleFiles = false;
  @api recordId;
  @api uploadedFileNames = [];

  @track uploadedFiles = [];

  get acceptedFormats() {
    return this.formats.split(",");
  }

  get showStateFilesUploaded() {
    return this.uploadedFiles.length > 0;
  }

  getExt(ext) {
    let icons = ["csv", "pdf", "rtf", "txt", "zip"];
    let images = ["gif", "jpeg", "jpg", "png"];
    if (icons.includes(ext)) return ext;
    if (images.includes(ext)) return "image";
    return "attachment";
  }

  handleOnUploadFinished(e) {
    try {
      let files = e.detail.files;
      for (let i = 0; i < files.length; i++) {
        let file = files[i];
        file.ext = this.getExt(file.name.split(".")[1]);
        file.icon = "doctype:" + file.ext;
        this.uploadedFiles.push(file);
        console.log("@cIDs", this.contentDocumentIDs);
        console.log("@uFNs", this.uploadedFileNames);
        console.log("@rID", this.recordId);
      }
      files.forEach((file) => {
        console.log("Uploaded => ", file.documentId, file.name);
        this.contentDocumentIDs.push(file.documentId);
        this.uploadedFileNames.push(file.name);
      });
      console.log("@e", e, files);
      ["contentDocumentIDs", "uploadedFileNames", "recordId"].forEach((prop) =>
        this.dispatchEvent(new FlowAttributeChangeEvent(prop, this[prop]))
      );
    } catch (err) {
      console.error(err);
    }
  }
}
