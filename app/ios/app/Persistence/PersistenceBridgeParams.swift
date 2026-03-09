import Foundation

@available(iOS 17.0, *)
protocol DictionaryDecodable: Decodable {}

@available(iOS 17.0, *)
extension DictionaryDecodable {
  static func decode(from params: NSDictionary) throws -> Self {
    guard JSONSerialization.isValidJSONObject(params) else {
      throw PersistenceError.decodeError("Invalid dictionary payload")
    }
    let data = try JSONSerialization.data(withJSONObject: params, options: [])
    let decoder = JSONDecoder()
    return try decoder.decode(Self.self, from: data)
  }
}

@available(iOS 17.0, *)
struct SaveSettingsParams: DictionaryDecodable {
  let dailyTargetTime: Int
  let defaultDuration: Int
  let retryLimit: Int
  let dayRolloverHour: Int
}

@available(iOS 17.0, *)
struct SaveBookParams: DictionaryDecodable {
  let id: String
  let title: String
  let author: String?
  let googleBooksId: String?
  let thumbnailUrl: String?
  let pageCount: Int?
  let format: String?
  let status: String?
  let estimatedPriceAmount: Double?
  let estimatedPriceCurrency: String?
}

@available(iOS 17.0, *)
struct UpsertPlanParams: DictionaryDecodable {
  let planId: String?
  let planDate: String
  let bookId: String?
  let state: String?
  let result: String?
  let scheduledAt: String?
  let retryCount: Int?
  let snoozeCount: Int?
  let consistencyCredit: Bool?
  let continuousMissedDaysSnapshot: Int?
  let startedAt: String?
}
