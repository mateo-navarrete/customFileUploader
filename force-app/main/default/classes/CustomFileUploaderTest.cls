/**
 * @description       :
 * @author            : mateo navarrete
 * @group             : BizOps
 * @last modified on  : 12-20-2020
 * @last modified by  : mateo navarrete
 * Modifications Log
 * Ver   Date         Author            Modification
 * 1.0   12-16-2020   mateo navarrete   Initial Version
 **/
@isTest
public class CustomFileUploaderTest {
  @isTest
  static void testDeleteDocumentsSuccess() {
    Test.startTest();
    Map<String, Boolean> testMap = new Map<String, Boolean>();
    testMap.put('success', true);
    try {
      ContentVersion cvData = new ContentVersion(
        Title = 'Test',
        PathOnClient = 'Test.pdf',
        VersionData = Blob.valueOf('Test Content Data'),
        IsMajorVersion = true
      );
      insert cvData;

      ContentDocument[] cd = [SELECT Id, Title FROM ContentDocument];
      String[] cdIDs = new List<String>();
      cdIDs.add(cd[0].Id);

      Map<String, Boolean> result = CustomFileUploaderController.deleteDocuments(
        cdIDs
      );
      System.assertEquals(testMap, result, 'Expected success === true.');

      // ContentVersion cvId = [
      //   SELECT Id, Title, ContentDocumentId
      //   FROM ContentVersion
      //   WHERE Id = :cvData.Id
      //   LIMIT 1
      // ];
      // String[] testDocs = new List<String>();
      // testDocs.add(cvData.id);
      // Map<String, Boolean> tdResult = CustomFileUploaderController.deleteDocuments(
      //   testDocs
      // );
    } catch (Exception e) {
      System.assert(
        e.getMessage().contains('ExceptionMessage:'),
        'Expected a specific err msg.'
      );
      System.assert(
        e.getMessage().contains('ExceptionCause:'),
        'Expected a specific err msg.'
      );
    }
    Test.stopTest();
  }

  @isTest
  static void testDeleteDocumentsError() {
    Test.startTest();
    try {
      String[] testDocs = new List<String>();
      testDocs.add('06941000000vgsFAAQ');
      CustomFileUploaderController.deleteDocuments(testDocs);
    } catch (Exception e) {
      System.assert(
        e.getMessage().contains('ExceptionMessage:'),
        'Expected a specific err msg.'
      );
      System.assert(
        e.getMessage().contains('ExceptionCause:'),
        'Expected a specific err msg.'
      );
    }
    Test.stopTest();
  }
}
