import { LightningElement, api, track } from "lwc";
import { FlowAttributeChangeEvent } from "lightning/flowSupport";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import { deleteRecord } from "lightning/uiRecordApi";

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
  @track uploadedFiles = [];
  deactivateFileUploader = false;
  flowProps = ["contentDocumentIDs", "uploadedFileNames", "recordId"];
  selectedRecordId = "";
  showLoadingSpinner = false;
  showModal = false;

  get acceptedFormats() {
    return this.formats.split(",");
  }

  get showUploadedFiles() {
    return this.uploadedFiles.length > 0;
  }

  filterContentDocumentIDs(file) {
    return this.contentDocumentIDs.filter((id) => id !== file.documentId);
  }

  filterUploadedFileNames(file) {
    return this.uploadedFileNames.filter((name) => name !== file.name);
  }

  filterUploadedFiles(file) {
    return this.uploadedFiles.filter((f) => f.documentId !== file.documentId);
  }

  getDeletedFile() {
    let deleted = this.uploadedFiles.filter(
      (f) => f.documentId === this.selectedRecordId
    );
    return deleted[0];
  }

  getExt(ext) {
    let icons = ["csv", "pdf", "rtf", "txt", "zip"];
    let images = ["gif", "jpeg", "jpg", "png"];
    if (icons.includes(ext)) return ext;
    if (images.includes(ext)) return "image";
    return "attachment";
  }

  handleCancel() {
    this.selectedRecordId = "";
  }

  handleClick(e) {
    const { name, value } = e.target;
    const method = "handle" + name.charAt(0).toUpperCase() + name.slice(1);
    if (this[method]) this[method](value);
    this.showModal = !this.showModal;
  }

  handleConfirm() {
    this.showLoadingSpinner = true;
    deleteRecord(this.selectedRecordId)
      .then(() => {
        let file = this.getDeletedFile();
        this.contentDocumentIDs = this.filterContentDocumentIDs(file);
        this.uploadedFileNames = this.filterUploadedFileNames(file);
        this.uploadedFiles = this.filterUploadedFiles(file);
        this.toggleFileUploader();
        this.updateFlowProps();
      })
      .catch((error) => {
        this.showErrorMsg(error);
      })
      .finally(() => {
        this.selectedRecordId = "";
        this.showLoadingSpinner = false;
      });
  }

  handleDelete(value) {
    this.selectedRecordId = value;
  }

  handleOnUploadFinished(e) {
    try {
      let files = e.detail.files;
      files.forEach((f) => {
        let file = this.updateFile(f);
        this.contentDocumentIDs = this.updateItems(
          "contentDocumentIDs",
          file.documentId
        );
        this.uploadedFileNames = this.updateItems(
          "uploadedFileNames",
          file.name
        );
        this.uploadedFiles = this.updateItems("uploadedFiles", file);
      });
      this.toggleFileUploader();
      this.updateFlowProps();
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  showErrorMsg(error) {
    let eMsg;
    if (error.body) {
      if (error.body.message) {
        eMsg = error.body.message;
        if (error.body.stackTrace) {
          eMsg = error.body.message + "\nStackTrace:\n" + error.body.stackTrace;
        }
      }
    }
    const errMsg = {
      title: "ERROR: customFileUploader",
      message: eMsg || error.message,
      variant: "error",
      mode: "sticky"
    };
    this.showNotification(errMsg);
  }

  showFileUploader() {
    return this.multipleFiles || !this.uploadedFiles.length;
  }

  showNotification(msg) {
    const notification = new ShowToastEvent({
      title: msg.title,
      message: msg.message,
      variant: msg.variant,
      mode: msg.mode
    });
    this.dispatchEvent(notification);
  }

  toggleFileUploader() {
    if (this.showFileUploader()) {
      this.deactivateFileUploader = false;
      return;
    }
    this.deactivateFileUploader = true;
  }

  updateFile(file) {
    let copy = { ...file };
    copy.ext = this.getExt(file.name.split(".")[1]);
    copy.icon = "doctype:" + copy.ext;
    return copy;
  }

  updateItems(items, item) {
    let copy = [...this[items]];
    copy.push(item);
    return copy;
  }

  updateFlowProps() {
    this.flowProps.forEach((prop) =>
      this.dispatchEvent(new FlowAttributeChangeEvent(prop, this[prop]))
    );
  }
}
