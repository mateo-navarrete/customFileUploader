import { LightningElement, track } from "lwc";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import getOrgData from "@salesforce/apex/MockDataAPIController.getOrgData";
import loadMockData from "@salesforce/apex/MockDataAPIController.loadMockData";
import removeMockData from "@salesforce/apex/MockDataAPIController.removeMockData";
import validateEmptyDB from "@salesforce/apex/MockDataAPIController.validateEmptyDB";

export default class SAdminPanel extends LightningElement {
  @track isEmpty;
  @track isSandbox;
  @track loadingMockData;
  @track loadingOrgData;
  @track orgData;
  @track removingMockData;

  dbIsNotEmptyMsg = {
    title: "NOTE: sAdminPanel",
    message:
      'As a safeguard, the loadMockData feature is only available if no records exist. The removeMockData feature will not remove portal users, nor accounts & contacts associated with a case or without a phone number pattern of "(###) 555-####". Any existing records that do not follow this phone number pattern, or records associated with a case, or any portal users, will need to be deleted individually.',
    variant: "info",
    mode: "sticky"
  };

  async onActivate() {
    let isEmpty;
    let result;
    let sandboxErr =
      "Error occurred validating non production environment. As a safeguard, sAdminPanel functionality is only available in a non-production environment.";
    try {
      result = await this.onGetOrgData();
      if (result.IsSandbox) {
        isEmpty = await this.onValidateEmptyDB();
        if (!isEmpty) {
          this.showAlertMsg(this.dbIsNotEmptyMsg);
        }
      } else {
        throw new Error(sandboxErr);
      }
    } catch (err) {
      this.showErrorMsg(err);
    }
  }

  async onGetOrgData() {
    let result;
    this.loadingOrgData = true;
    try {
      result = await getOrgData();
      this.orgData = result;
      this.isSandbox = result.IsSandbox;
    } catch (err) {
      this.orgData = undefined;
      this.isSandbox = false;
      this.showErrorMsg(err);
    } finally {
      this.loadingOrgData = false;
    }
    return result;
  }

  async onValidateEmptyDB() {
    let result;
    try {
      result = await validateEmptyDB();
      this.isEmpty = result;
    } catch (err) {
      this.isEmpty = false;
      this.showErrorMsg(err);
    }
    return result;
  }

  async onLoadMockData() {
    let result;
    this.loadingMockData = true;
    try {
      result = await loadMockData();
      if (result.success) {
        this.showAlertMsg({ message: "Loaded MockData: Accounts & Contacts" });
        this.isEmpty = false;
      }
    } catch (err) {
      this.showErrorMsg(err);
    } finally {
      this.loadingMockData = false;
    }
  }

  async onRemoveMockData() {
    let isEmpty;
    let result;
    this.removingMockData = true;
    try {
      result = await removeMockData();
      if (result.success) {
        this.showAlertMsg({ message: "Removed MockData: Accounts & Contacts" });
        isEmpty = await this.onValidateEmptyDB();
        if (!isEmpty) {
          this.showAlertMsg(this.dbIsNotEmptyMsg);
        }
      }
    } catch (err) {
      this.showErrorMsg(err);
    } finally {
      this.removingMockData = false;
    }
  }

  get showStateUnactivated() {
    return !this.orgData;
  }

  get showStateUnactivatedButton() {
    return !this.orgData && !this.loadingOrgData;
  }

  get showStateUnactivatedSpinner() {
    return !this.orgData && this.loadingOrgData;
  }

  get showStateActivatedProduction() {
    return this.orgData && !this.isSandbox;
  }

  get showStateActivatedSandbox() {
    return this.orgData && this.isSandbox;
  }

  get showStateLoadMockDataButton() {
    return (
      this.orgData && this.isSandbox && this.isEmpty && !this.loadingMockData
    );
  }

  get showStateLoadMockDataSpinner() {
    return (
      this.orgData && this.isSandbox && this.isEmpty && this.loadingMockData
    );
  }

  get showStateRemoveMockDataButton() {
    return this.orgData && this.isSandbox && !this.removingMockData;
  }

  get showStateRemoveMockDataSpinner() {
    return this.orgData && this.isSandbox && this.removingMockData;
  }

  showAlertMsg(msg) {
    const alertMsg = {
      title: msg.title || "SUCCESS: sAdminPanel",
      message: msg.message,
      variant: msg.variant || "success",
      mode: msg.mode || "default"
    };
    this.showNotification(alertMsg);
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
      title: "ERROR: sAdminPanel",
      message: eMsg || error.message,
      variant: "error",
      mode: "sticky"
    };
    this.showNotification(errMsg);
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
}