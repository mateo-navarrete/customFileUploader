/**
 * @description       : tests MockDataAPIController.cls
 * @author            : mateo navarrete
 * @group             : BizOps
 * @last modified on  : 12-04-2020
 * @last modified by  : mateo navarrete
 * Modifications Log
 * Ver   Date         Author                               Modification
 * 1.0   11-19-2020   mateo navarrete   Initial Version
 **/
@isTest
public class MockDataAPIControllerTest {
  public static Organization checkOrgData() {
    return [SELECT Id, InstanceName, IsSandbox, Name FROM Organization LIMIT 1];
  }
  @isTest
  static void testGetOrgData() {
    Test.startTest();
    Organization org = MockDataAPIControllerTest.checkOrgData();
    try {
      Organization orgResult = MockDataAPIController.getOrgData();
      System.assertEquals(org.Id, orgResult.Id, 'Expected org.Id.');
      System.assertEquals(
        org.InstanceName,
        orgResult.InstanceName,
        'Expected org.InstanceName.'
      );
      System.assertEquals(
        org.IsSandbox,
        orgResult.IsSandbox,
        'Expected org.IsSandbox.'
      );
      System.assertEquals(org.Name, orgResult.Name, 'Expected org.Name.');
    } catch (Exception e) {
      System.assert(
        e.getMessage().contains('Error occurred getting Org data.'),
        'Expected a specific err msg.'
      );
    }
    Test.stopTest();
  }
  @isTest
  static void testGetMockData() {
    Test.startTest();
    try {
      String[] getMockDataResult = MockDataAPIController.getMockData(
        'mockDataAccounts'
      );
      System.assert(
        getMockDataResult.size() > 1,
        'Expected a populated array.'
      );
    } catch (Exception e) {
      System.assert(
        e.getMessage().contains('Error occurred getting mock data.'),
        'Expected a specific err msg.'
      );
    }
    Test.stopTest();
  }
  @isTest
  static void testGetMockDataErr() {
    Test.startTest();
    try {
      String[] getMockDataResult = MockDataAPIController.getMockData('');
      String[] emptyArr = new List<String>();
      System.assertEquals(
        emptyArr,
        getMockDataResult,
        'Expected empty string list to === empty string list.'
      );
    } catch (Exception e) {
      System.assert(
        e.getMessage().contains('Error occurred getting mock data'),
        'Expected a specific err msg.'
      );
    }
    Test.stopTest();
  }
  @isTest
  static void testLoadMockData() {
    Test.startTest();
    Map<String, Boolean> testMap = new Map<String, Boolean>();
    testMap.put('success', true);
    try {
      Map<String, Boolean> result = MockDataAPIController.loadMockData();
      System.assertEquals(testMap, result, 'Expected success === true.');
    } catch (Exception e) {
      System.assert(
        e.getMessage().contains('Error'),
        'Expected a specific err msg.'
      );
    }
    Test.stopTest();
  }
  @isTest
  static void testLoadMockDataDBNotEmpty() {
    Test.startTest();
    Account a = new Account(Name = 'mcTest Acct', Phone = '9875554321');
    insert a;
    try {
      Map<String, Boolean> result = MockDataAPIController.loadMockData();
    } catch (Exception e) {
      System.assert(
        e.getMessage().contains('Error occurred loading mock data.'),
        'Expected a specific err msg.'
      );
    }
    Test.stopTest();
  }

  @isTest
  static void testRemoveMockData() {
    Test.startTest();
    Map<String, Boolean> testMap = new Map<String, Boolean>();
    testMap.put('success', true);
    Account a = new Account(Name = 'mcTest Acct', Phone = '9875554321');
    insert a;
    Contact c = new Contact(
      FirstName = 'mcTest',
      LastName = 'Con',
      Phone = '12345556789'
    );
    insert c;
    try {
      Map<String, Boolean> result = MockDataAPIController.removeMockData();
      System.assertEquals(testMap, result, 'Expected success === true.');
    } catch (Exception e) {
      System.assert(
        e.getMessage().contains('Error'),
        'Expected a specific err msg.'
      );
    }
    Test.stopTest();
  }
  @isTest
  static void testIsMockPhone() {
    Test.startTest();
    Boolean phoneShort = MockDataAPIController.isMockPhone('1234555');
    Boolean phoneDash = MockDataAPIController.isMockPhone('123-555-1234');
    Boolean phoneSpace = MockDataAPIController.isMockPhone('123 555 1234');
    Boolean phoneNoSpace = MockDataAPIController.isMockPhone('1235551234');
    Boolean phoneWith555 = MockDataAPIController.isMockPhone('5551234567');
    System.assertEquals(phoneShort, true, 'Expected true.');
    System.assertEquals(phoneDash, true, 'Expected true.');
    System.assertEquals(phoneSpace, true, 'Expected true.');
    System.assertEquals(phoneNoSpace, true, 'Expected true.');
    System.assertEquals(phoneWith555, false, 'Expected false.');
    Test.stopTest();
  }
}