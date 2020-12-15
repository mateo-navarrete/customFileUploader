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
  @api title = "Upload files";
  @api uploadedFileNames = [];
  // @TODO: handle disable = mulitpleFiles===T ? F : uploadedFiles.length ? T : F
  // merge with portalFileUploader?

  @track uploadedFiles = [];
  flowProps = ["contentDocumentIDs", "uploadedFileNames", "recordId"];
  inactive = false;

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
      files.forEach((file) => {
        this.contentDocumentIDs.push(file.documentId);
        this.uploadedFileNames.push(file.name);
        this.updateUploadedFiles(file);
      });
      this.flowProps.forEach((prop) =>
        this.dispatchEvent(new FlowAttributeChangeEvent(prop, this[prop]))
      );
      this.updateInactiveStatus();
    } catch (err) {
      console.error(err);
    }
  }

  updateInactiveStatus() {
    if (this.multipleFiles || !this.showStateFilesUploaded()) return;
    this.inactive = true;
  }

  updateUploadedFiles(file) {
    file.ext = this.getExt(file.name.split(".")[1]);
    file.icon = "doctype:" + file.ext;
    this.uploadedFiles.push(file);
  }
}
