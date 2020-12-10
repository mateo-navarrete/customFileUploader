/**
 * @description       : In a valid sandbox environment, the mockDataAPIController allows sadmins to load & remove mockData. Several safeguards are in place to prevent misuse.
 * @author            : mateo navarrete
 * @group             : BizOps
 * @last modified on  : 12-04-2020
 * @last modified by  : mateo navarrete
 * Modifications Log
 * Ver   Date         Author                               Modification
 * 1.0   11-19-2020   mateo navarrete   Initial Version
 **/
public with sharing class MockDataAPIController {
  private static void catchErr(String msg, Exception e) {
    throw new MockDataException(
      msg +
      '\nExceptionMessage: ' +
      e.getMessage() +
      '\nExceptionCause: ' +
      e.getCause()
    );
  }

  @AuraEnabled
  public static Organization getOrgData() {
    Organization org = new Organization();
    org = [SELECT Id, InstanceName, IsSandbox, Name FROM Organization LIMIT 1];
    return org;
  }

  @AuraEnabled
  public static Boolean validateEmptyDB() {
    Boolean isEmpty = false;
    Account[] a = [SELECT Id FROM Account LIMIT 2];
    Contact[] c = [SELECT Id FROM Contact LIMIT 2];
    isEmpty = (a.size() + c.size()) < 1;
    return isEmpty;
  }

  @AuraEnabled
  public static Map<String, Boolean> loadMockData() {
    Map<String, Boolean> result = new Map<String, Boolean>();
    result.put('success', false);
    try {
      if (!getOrgData().IsSandbox) {
        throw new MockDataException(
          'Error occurred validating non production environment. As a safeguard, sAdminPanel functionality is only available in a non-production environment.'
        );
      } else if (!validateEmptyDB()) {
        throw new MockDataException(
          'Error occurred validating the database is empty. As a safeguard, sAdminPanel functionality is only available if no records exist. The removeMockData feature will only remove accounts & contacts with a phone number pattern of "(###) 555-####". Any existing records that do not follow this phone number pattern will need to be deleted individually.'
        );
      } else {
        Account[] mockAccounts = insertMockAccounts();
        insertMockContacts(mockAccounts);
        result.put('success', true);
      }
    } catch (Exception e) {
      result.put('success', false);
      catchErr('Error occurred loading mock data.', e);
    }
    return result;
  }

  private static Account[] insertMockAccounts() {
    Account[] mockAccounts = new List<Account>();
    try {
      String[] mockDataAccounts = getMockData('mockDataAccounts');
      mockAccounts = createAccounts(mockDataAccounts);
      insert mockAccounts;
    } catch (DmlException e) {
      catchErr('Error occurred inserting mock Accounts.', e);
    }
    return mockAccounts;
  }

  @TestVisible
  private static String[] getMockData(String csvFile) {
    String[] mockData = new List<String>{};
    try {
      StaticResource sr = [
        SELECT Body
        FROM StaticResource
        WHERE Name LIKE :csvFile
        LIMIT 1
      ];
      // Blob blobData = sr.Body;
      String csvData = sr.Body.toString();
      mockData = csvData.split('\n');
    } catch (Exception e) {
      catchErr('Error occurred getting mock data.\ncsvFile: ' + csvFile, e);
    }
    return mockData;
  }

  private static Account[] createAccounts(String[] mockDataAccounts) {
    Account[] createdAccounts = new List<Account>();
    // start iteration at mockDataAccounts[1]
    // per mockDataAccounts[0] = ['Name','Acct_Stage','Record_Type']
    // NOTE: Record_Type = RecordTypeId = '012i0000001AZTYAA4'
    // is correctly & automatically populated at record creation
    // thus no need here for mockRecord[2] = Record_Type
    for (Integer i = 1; i < mockDataAccounts.size(); i++) {
      Account a = new Account();
      String[] mockRecord = mockDataAccounts[i].split(',');
      a.Name = mockRecord[0];
      a.Experimental_Acct_Stage__c = mockRecord[1];
      a.Phone = String.valueOf(1235551000 + i);
      createdAccounts.add(a);
    }
    return createdAccounts;
  }

  private static void insertMockContacts(Account[] mockAccounts) {
    Contact[] mockContacts = new List<Contact>();
    try {
      String[] mockDataContacts = getMockData('mockDataContacts');
      mockContacts = createContacts(mockDataContacts, mockAccounts);
      insert mockContacts;
    } catch (DmlException e) {
      catchErr('Error occurred inserting mock Contacts.', e);
    }
  }

  private static Contact[] createContacts(
    String[] mockDataContacts,
    Account[] mockAccounts
  ) {
    Contact[] createdContacts = new List<Contact>();
    for (Integer i = 1; i < mockDataContacts.size(); i++) {
      Contact c = new Contact();
      String[] mockRecord = mockDataContacts[i].split(',');
      String accountName = mockRecord[0];
      c.AccountId = filterAccountIdByName(mockAccounts, accountName);
      c.FirstName = mockRecord[1];
      c.LastName = mockRecord[2];
      c.Email = mockRecord[3];
      c.Phone = String.valueOf(1235553000 + i);
      createdContacts.add(c);
    }
    return createdContacts;
  }

  @TestVisible
  private static String filterAccountIdByName(
    Account[] mockAccounts,
    String accountName
  ) {
    String accountId = '';
    for (Account a : mockAccounts) {
      if (a.Name == accountName) {
        accountId = a.Id;
        break;
      }
    }
    return accountId;
  }

  @AuraEnabled
  public static Map<String, Boolean> removeMockData() {
    Map<String, Boolean> result = new Map<String, Boolean>();
    result.put('success', false);
    try {
      if (!getOrgData().IsSandbox) {
        throw new MockDataException(
          'Error occurred validating non production environment. As a safeguard, sAdminPanel functionality is only available in a non-production environment.'
        );
      } else {
        deleteMockContacts();
        deleteMockAccounts();
        result.put('success', true);
      }
    } catch (Exception e) {
      result.put('success', false);
      catchErr('Error occurred removing mock data.', e);
    }
    return result;
  }

  private static Boolean deleteMockContacts() {
    Contact[] contactsByPhone = new List<Contact>();
    try {
      contactsByPhone = getContactsByPhone();
      if (contactsByPhone.size() > 0) {
        Contact[] filteredContacts = filterContactsByPhone(contactsByPhone);
        if (filteredContacts.size() > 0) {
          delete filteredContacts;
        }
      }
    } catch (DmlException e) {
      catchErr('Error occurred deleting mock Contacts.', e);
    }
    return true;
  }

  private static List<Contact> getContactsByPhone() {
    Contact[] contactsByPhone = new List<Contact>();
    for (Contact c : [SELECT Id, Phone FROM Contact WHERE Phone LIKE '%555%']) {
      contactsByPhone.add(c);
    }
    return contactsByPhone;
  }

  private static List<Contact> filterContactsByPhone(
    List<Contact> contactsByPhone
  ) {
    Contact[] filteredContacts = new List<Contact>();
    for (Contact c : contactsByPhone) {
      if (isMockPhone(c.Phone)) {
        filteredContacts.add(c);
      }
    }
    return filteredContacts;
  }

  private static Boolean deleteMockAccounts() {
    Account[] accountsByPhone = new List<Account>();
    try {
      accountsByPhone = getAccountsByPhone();
      if (accountsByPhone.size() > 0) {
        Account[] filteredAccounts = filterAccountsByPhone(accountsByPhone);
        if (filteredAccounts.size() > 0) {
          delete filteredAccounts;
        }
      }
    } catch (DmlException e) {
      catchErr('Error occurred deleting mock Accounts.', e);
    }
    return true;
  }

  private static List<Account> getAccountsByPhone() {
    Account[] accountsByPhone = new List<Account>();
    for (Account a : [SELECT Id, Phone FROM Account WHERE Phone LIKE '%555%']) {
      accountsByPhone.add(a);
    }
    return accountsByPhone;
  }

  private static List<Account> filterAccountsByPhone(
    List<Account> accountsByPhone
  ) {
    Account[] filteredAccounts = new List<Account>();
    for (Account a : accountsByPhone) {
      if (isMockPhone(a.Phone)) {
        filteredAccounts.add(a);
      }
    }
    return filteredAccounts;
  }

  @TestVisible
  private static Boolean isMockPhone(String phone) {
    Integer i = phone.length();
    String s = phone.substring(i - 5, i - 4);
    if (i < 10) {
      return true;
    }
    if (s == '-' || s == ' ') {
      return phone.substring(i - 8, i - 5) == '555';
    } else if (s == '5') {
      return phone.substring(i - 7, i - 4) == '555';
    } else {
      return false;
    }
  }
}