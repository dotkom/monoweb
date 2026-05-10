
/**
 * Client
**/

import * as runtime from './runtime/library.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model Course
 * 
 */
export type Course = $Result.DefaultSelection<Prisma.$CoursePayload>
/**
 * Model Grade
 * 
 */
export type Grade = $Result.DefaultSelection<Prisma.$GradePayload>
/**
 * Model Faculty
 * 
 */
export type Faculty = $Result.DefaultSelection<Prisma.$FacultyPayload>
/**
 * Model Department
 * 
 */
export type Department = $Result.DefaultSelection<Prisma.$DepartmentPayload>

/**
 * Enums
 */
export namespace $Enums {
  export const Semester: {
  SPRING: 'SPRING',
  SUMMER: 'SUMMER',
  AUTUMN: 'AUTUMN'
};

export type Semester = (typeof Semester)[keyof typeof Semester]


export const StudyLevel: {
  FOUNDATION: 'FOUNDATION',
  INTERMEDIATE: 'INTERMEDIATE',
  BACHELOR_ADVANCED: 'BACHELOR_ADVANCED',
  MASTER: 'MASTER',
  PHD: 'PHD',
  CONTINUING_EDUCATION: 'CONTINUING_EDUCATION',
  UNKNOWN: 'UNKNOWN'
};

export type StudyLevel = (typeof StudyLevel)[keyof typeof StudyLevel]


export const GradeType: {
  PASS_FAIL: 'PASS_FAIL',
  LETTER: 'LETTER'
};

export type GradeType = (typeof GradeType)[keyof typeof GradeType]


export const Campus: {
  TRONDHEIM: 'TRONDHEIM',
  GJOVIK: 'GJOVIK',
  ALESUND: 'ALESUND'
};

export type Campus = (typeof Campus)[keyof typeof Campus]


export const TeachingLanguage: {
  NORWEGIAN: 'NORWEGIAN',
  ENGLISH: 'ENGLISH'
};

export type TeachingLanguage = (typeof TeachingLanguage)[keyof typeof TeachingLanguage]

}

export type Semester = $Enums.Semester

export const Semester: typeof $Enums.Semester

export type StudyLevel = $Enums.StudyLevel

export const StudyLevel: typeof $Enums.StudyLevel

export type GradeType = $Enums.GradeType

export const GradeType: typeof $Enums.GradeType

export type Campus = $Enums.Campus

export const Campus: typeof $Enums.Campus

export type TeachingLanguage = $Enums.TeachingLanguage

export const TeachingLanguage: typeof $Enums.TeachingLanguage

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Courses
 * const courses = await prisma.course.findMany()
 * ```
 *
 *
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  const U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   *
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more Courses
   * const courses = await prisma.course.findMany()
   * ```
   *
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): PrismaClient;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>


  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb<ClientOptions>, ExtArgs, $Utils.Call<Prisma.TypeMapCb<ClientOptions>, {
    extArgs: ExtArgs
  }>>

      /**
   * `prisma.course`: Exposes CRUD operations for the **Course** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Courses
    * const courses = await prisma.course.findMany()
    * ```
    */
  get course(): Prisma.CourseDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.grade`: Exposes CRUD operations for the **Grade** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Grades
    * const grades = await prisma.grade.findMany()
    * ```
    */
  get grade(): Prisma.GradeDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.faculty`: Exposes CRUD operations for the **Faculty** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Faculties
    * const faculties = await prisma.faculty.findMany()
    * ```
    */
  get faculty(): Prisma.FacultyDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.department`: Exposes CRUD operations for the **Department** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Departments
    * const departments = await prisma.department.findMany()
    * ```
    */
  get department(): Prisma.DepartmentDelegate<ExtArgs, ClientOptions>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
   * Metrics
   */
  export type Metrics = runtime.Metrics
  export type Metric<T> = runtime.Metric<T>
  export type MetricHistogram = runtime.MetricHistogram
  export type MetricHistogramBucket = runtime.MetricHistogramBucket

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 6.19.3
   * Query Engine version: c2990dca591cba766e3b7ef5d9e8a84796e47ab7
   */
  export type PrismaVersion = {
    client: string
  }

  export const prismaVersion: PrismaVersion

  /**
   * Utility Types
   */


  export import Bytes = runtime.Bytes
  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? P : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    Course: 'Course',
    Grade: 'Grade',
    Faculty: 'Faculty',
    Department: 'Department'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]


  export type Datasources = {
    db?: Datasource
  }

  interface TypeMapCb<ClientOptions = {}> extends $Utils.Fn<{extArgs: $Extensions.InternalArgs }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], ClientOptions extends { omit: infer OmitOptions } ? OmitOptions : {}>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> = {
    globalOmitOptions: {
      omit: GlobalOmitOptions
    }
    meta: {
      modelProps: "course" | "grade" | "faculty" | "department"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      Course: {
        payload: Prisma.$CoursePayload<ExtArgs>
        fields: Prisma.CourseFieldRefs
        operations: {
          findUnique: {
            args: Prisma.CourseFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CoursePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.CourseFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CoursePayload>
          }
          findFirst: {
            args: Prisma.CourseFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CoursePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.CourseFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CoursePayload>
          }
          findMany: {
            args: Prisma.CourseFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CoursePayload>[]
          }
          create: {
            args: Prisma.CourseCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CoursePayload>
          }
          createMany: {
            args: Prisma.CourseCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.CourseCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CoursePayload>[]
          }
          delete: {
            args: Prisma.CourseDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CoursePayload>
          }
          update: {
            args: Prisma.CourseUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CoursePayload>
          }
          deleteMany: {
            args: Prisma.CourseDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.CourseUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.CourseUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CoursePayload>[]
          }
          upsert: {
            args: Prisma.CourseUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CoursePayload>
          }
          aggregate: {
            args: Prisma.CourseAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateCourse>
          }
          groupBy: {
            args: Prisma.CourseGroupByArgs<ExtArgs>
            result: $Utils.Optional<CourseGroupByOutputType>[]
          }
          count: {
            args: Prisma.CourseCountArgs<ExtArgs>
            result: $Utils.Optional<CourseCountAggregateOutputType> | number
          }
        }
      }
      Grade: {
        payload: Prisma.$GradePayload<ExtArgs>
        fields: Prisma.GradeFieldRefs
        operations: {
          findUnique: {
            args: Prisma.GradeFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GradePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.GradeFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GradePayload>
          }
          findFirst: {
            args: Prisma.GradeFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GradePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.GradeFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GradePayload>
          }
          findMany: {
            args: Prisma.GradeFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GradePayload>[]
          }
          create: {
            args: Prisma.GradeCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GradePayload>
          }
          createMany: {
            args: Prisma.GradeCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.GradeCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GradePayload>[]
          }
          delete: {
            args: Prisma.GradeDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GradePayload>
          }
          update: {
            args: Prisma.GradeUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GradePayload>
          }
          deleteMany: {
            args: Prisma.GradeDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.GradeUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.GradeUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GradePayload>[]
          }
          upsert: {
            args: Prisma.GradeUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GradePayload>
          }
          aggregate: {
            args: Prisma.GradeAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateGrade>
          }
          groupBy: {
            args: Prisma.GradeGroupByArgs<ExtArgs>
            result: $Utils.Optional<GradeGroupByOutputType>[]
          }
          count: {
            args: Prisma.GradeCountArgs<ExtArgs>
            result: $Utils.Optional<GradeCountAggregateOutputType> | number
          }
        }
      }
      Faculty: {
        payload: Prisma.$FacultyPayload<ExtArgs>
        fields: Prisma.FacultyFieldRefs
        operations: {
          findUnique: {
            args: Prisma.FacultyFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FacultyPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.FacultyFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FacultyPayload>
          }
          findFirst: {
            args: Prisma.FacultyFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FacultyPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.FacultyFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FacultyPayload>
          }
          findMany: {
            args: Prisma.FacultyFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FacultyPayload>[]
          }
          create: {
            args: Prisma.FacultyCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FacultyPayload>
          }
          createMany: {
            args: Prisma.FacultyCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.FacultyCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FacultyPayload>[]
          }
          delete: {
            args: Prisma.FacultyDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FacultyPayload>
          }
          update: {
            args: Prisma.FacultyUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FacultyPayload>
          }
          deleteMany: {
            args: Prisma.FacultyDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.FacultyUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.FacultyUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FacultyPayload>[]
          }
          upsert: {
            args: Prisma.FacultyUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FacultyPayload>
          }
          aggregate: {
            args: Prisma.FacultyAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateFaculty>
          }
          groupBy: {
            args: Prisma.FacultyGroupByArgs<ExtArgs>
            result: $Utils.Optional<FacultyGroupByOutputType>[]
          }
          count: {
            args: Prisma.FacultyCountArgs<ExtArgs>
            result: $Utils.Optional<FacultyCountAggregateOutputType> | number
          }
        }
      }
      Department: {
        payload: Prisma.$DepartmentPayload<ExtArgs>
        fields: Prisma.DepartmentFieldRefs
        operations: {
          findUnique: {
            args: Prisma.DepartmentFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DepartmentPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.DepartmentFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DepartmentPayload>
          }
          findFirst: {
            args: Prisma.DepartmentFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DepartmentPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.DepartmentFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DepartmentPayload>
          }
          findMany: {
            args: Prisma.DepartmentFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DepartmentPayload>[]
          }
          create: {
            args: Prisma.DepartmentCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DepartmentPayload>
          }
          createMany: {
            args: Prisma.DepartmentCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.DepartmentCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DepartmentPayload>[]
          }
          delete: {
            args: Prisma.DepartmentDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DepartmentPayload>
          }
          update: {
            args: Prisma.DepartmentUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DepartmentPayload>
          }
          deleteMany: {
            args: Prisma.DepartmentDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.DepartmentUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.DepartmentUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DepartmentPayload>[]
          }
          upsert: {
            args: Prisma.DepartmentUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DepartmentPayload>
          }
          aggregate: {
            args: Prisma.DepartmentAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateDepartment>
          }
          groupBy: {
            args: Prisma.DepartmentGroupByArgs<ExtArgs>
            result: $Utils.Optional<DepartmentGroupByOutputType>[]
          }
          count: {
            args: Prisma.DepartmentCountArgs<ExtArgs>
            result: $Utils.Optional<DepartmentCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasources?: Datasources
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasourceUrl?: string
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Shorthand for `emit: 'stdout'`
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events only
     * log: [
     *   { emit: 'event', level: 'query' },
     *   { emit: 'event', level: 'info' },
     *   { emit: 'event', level: 'warn' }
     *   { emit: 'event', level: 'error' }
     * ]
     * 
     * / Emit as events and log to stdout
     * og: [
     *  { emit: 'stdout', level: 'query' },
     *  { emit: 'stdout', level: 'info' },
     *  { emit: 'stdout', level: 'warn' }
     *  { emit: 'stdout', level: 'error' }
     * 
     * ```
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging#the-log-option).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
    /**
     * Instance of a Driver Adapter, e.g., like one provided by `@prisma/adapter-planetscale`
     */
    adapter?: runtime.SqlDriverAdapterFactory | null
    /**
     * Global configuration for omitting model fields by default.
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   omit: {
     *     user: {
     *       password: true
     *     }
     *   }
     * })
     * ```
     */
    omit?: Prisma.GlobalOmitConfig
  }
  export type GlobalOmitConfig = {
    course?: CourseOmit
    grade?: GradeOmit
    faculty?: FacultyOmit
    department?: DepartmentOmit
  }

  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type CheckIsLogLevel<T> = T extends LogLevel ? T : never;

  export type GetLogType<T> = CheckIsLogLevel<
    T extends LogDefinition ? T['level'] : T
  >;

  export type GetEvents<T extends any[]> = T extends Array<LogLevel | LogDefinition>
    ? GetLogType<T[number]>
    : never;

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'updateManyAndReturn'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */


  /**
   * Count Type CourseCountOutputType
   */

  export type CourseCountOutputType = {
    grades: number
  }

  export type CourseCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    grades?: boolean | CourseCountOutputTypeCountGradesArgs
  }

  // Custom InputTypes
  /**
   * CourseCountOutputType without action
   */
  export type CourseCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CourseCountOutputType
     */
    select?: CourseCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * CourseCountOutputType without action
   */
  export type CourseCountOutputTypeCountGradesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: GradeWhereInput
  }


  /**
   * Count Type FacultyCountOutputType
   */

  export type FacultyCountOutputType = {
    courses: number
    departments: number
  }

  export type FacultyCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    courses?: boolean | FacultyCountOutputTypeCountCoursesArgs
    departments?: boolean | FacultyCountOutputTypeCountDepartmentsArgs
  }

  // Custom InputTypes
  /**
   * FacultyCountOutputType without action
   */
  export type FacultyCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FacultyCountOutputType
     */
    select?: FacultyCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * FacultyCountOutputType without action
   */
  export type FacultyCountOutputTypeCountCoursesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CourseWhereInput
  }

  /**
   * FacultyCountOutputType without action
   */
  export type FacultyCountOutputTypeCountDepartmentsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: DepartmentWhereInput
  }


  /**
   * Count Type DepartmentCountOutputType
   */

  export type DepartmentCountOutputType = {
    courses: number
  }

  export type DepartmentCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    courses?: boolean | DepartmentCountOutputTypeCountCoursesArgs
  }

  // Custom InputTypes
  /**
   * DepartmentCountOutputType without action
   */
  export type DepartmentCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DepartmentCountOutputType
     */
    select?: DepartmentCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * DepartmentCountOutputType without action
   */
  export type DepartmentCountOutputTypeCountCoursesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CourseWhereInput
  }


  /**
   * Models
   */

  /**
   * Model Course
   */

  export type AggregateCourse = {
    _count: CourseCountAggregateOutputType | null
    _avg: CourseAvgAggregateOutputType | null
    _sum: CourseSumAggregateOutputType | null
    _min: CourseMinAggregateOutputType | null
    _max: CourseMaxAggregateOutputType | null
  }

  export type CourseAvgAggregateOutputType = {
    credits: number | null
    firstYearTaught: number | null
    lastYearTaught: number | null
    candidateCount: number | null
    averageGrade: number | null
    passRate: number | null
    latestYearCheckedForNtnuData: number | null
  }

  export type CourseSumAggregateOutputType = {
    credits: number | null
    firstYearTaught: number | null
    lastYearTaught: number | null
    candidateCount: number | null
    averageGrade: number | null
    passRate: number | null
    latestYearCheckedForNtnuData: number | null
  }

  export type CourseMinAggregateOutputType = {
    id: string | null
    code: string | null
    nameNo: string | null
    nameEn: string | null
    credits: number | null
    studyLevel: $Enums.StudyLevel | null
    gradeType: $Enums.GradeType | null
    firstYearTaught: number | null
    lastYearTaught: number | null
    contentNo: string | null
    contentEn: string | null
    teachingMethodsNo: string | null
    teachingMethodsEn: string | null
    learningOutcomesNo: string | null
    learningOutcomesEn: string | null
    examTypeNo: string | null
    examTypeEn: string | null
    candidateCount: number | null
    averageGrade: number | null
    passRate: number | null
    createdAt: Date | null
    updatedAt: Date | null
    facultyId: string | null
    departmentId: string | null
    latestYearCheckedForNtnuData: number | null
  }

  export type CourseMaxAggregateOutputType = {
    id: string | null
    code: string | null
    nameNo: string | null
    nameEn: string | null
    credits: number | null
    studyLevel: $Enums.StudyLevel | null
    gradeType: $Enums.GradeType | null
    firstYearTaught: number | null
    lastYearTaught: number | null
    contentNo: string | null
    contentEn: string | null
    teachingMethodsNo: string | null
    teachingMethodsEn: string | null
    learningOutcomesNo: string | null
    learningOutcomesEn: string | null
    examTypeNo: string | null
    examTypeEn: string | null
    candidateCount: number | null
    averageGrade: number | null
    passRate: number | null
    createdAt: Date | null
    updatedAt: Date | null
    facultyId: string | null
    departmentId: string | null
    latestYearCheckedForNtnuData: number | null
  }

  export type CourseCountAggregateOutputType = {
    id: number
    code: number
    nameNo: number
    nameEn: number
    credits: number
    studyLevel: number
    gradeType: number
    firstYearTaught: number
    lastYearTaught: number
    contentNo: number
    contentEn: number
    teachingMethodsNo: number
    teachingMethodsEn: number
    learningOutcomesNo: number
    learningOutcomesEn: number
    examTypeNo: number
    examTypeEn: number
    candidateCount: number
    averageGrade: number
    passRate: number
    createdAt: number
    updatedAt: number
    taughtSemesters: number
    teachingLanguages: number
    campuses: number
    facultyId: number
    departmentId: number
    latestYearCheckedForNtnuData: number
    _all: number
  }


  export type CourseAvgAggregateInputType = {
    credits?: true
    firstYearTaught?: true
    lastYearTaught?: true
    candidateCount?: true
    averageGrade?: true
    passRate?: true
    latestYearCheckedForNtnuData?: true
  }

  export type CourseSumAggregateInputType = {
    credits?: true
    firstYearTaught?: true
    lastYearTaught?: true
    candidateCount?: true
    averageGrade?: true
    passRate?: true
    latestYearCheckedForNtnuData?: true
  }

  export type CourseMinAggregateInputType = {
    id?: true
    code?: true
    nameNo?: true
    nameEn?: true
    credits?: true
    studyLevel?: true
    gradeType?: true
    firstYearTaught?: true
    lastYearTaught?: true
    contentNo?: true
    contentEn?: true
    teachingMethodsNo?: true
    teachingMethodsEn?: true
    learningOutcomesNo?: true
    learningOutcomesEn?: true
    examTypeNo?: true
    examTypeEn?: true
    candidateCount?: true
    averageGrade?: true
    passRate?: true
    createdAt?: true
    updatedAt?: true
    facultyId?: true
    departmentId?: true
    latestYearCheckedForNtnuData?: true
  }

  export type CourseMaxAggregateInputType = {
    id?: true
    code?: true
    nameNo?: true
    nameEn?: true
    credits?: true
    studyLevel?: true
    gradeType?: true
    firstYearTaught?: true
    lastYearTaught?: true
    contentNo?: true
    contentEn?: true
    teachingMethodsNo?: true
    teachingMethodsEn?: true
    learningOutcomesNo?: true
    learningOutcomesEn?: true
    examTypeNo?: true
    examTypeEn?: true
    candidateCount?: true
    averageGrade?: true
    passRate?: true
    createdAt?: true
    updatedAt?: true
    facultyId?: true
    departmentId?: true
    latestYearCheckedForNtnuData?: true
  }

  export type CourseCountAggregateInputType = {
    id?: true
    code?: true
    nameNo?: true
    nameEn?: true
    credits?: true
    studyLevel?: true
    gradeType?: true
    firstYearTaught?: true
    lastYearTaught?: true
    contentNo?: true
    contentEn?: true
    teachingMethodsNo?: true
    teachingMethodsEn?: true
    learningOutcomesNo?: true
    learningOutcomesEn?: true
    examTypeNo?: true
    examTypeEn?: true
    candidateCount?: true
    averageGrade?: true
    passRate?: true
    createdAt?: true
    updatedAt?: true
    taughtSemesters?: true
    teachingLanguages?: true
    campuses?: true
    facultyId?: true
    departmentId?: true
    latestYearCheckedForNtnuData?: true
    _all?: true
  }

  export type CourseAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Course to aggregate.
     */
    where?: CourseWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Courses to fetch.
     */
    orderBy?: CourseOrderByWithRelationInput | CourseOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: CourseWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Courses from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Courses.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Courses
    **/
    _count?: true | CourseCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: CourseAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: CourseSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: CourseMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: CourseMaxAggregateInputType
  }

  export type GetCourseAggregateType<T extends CourseAggregateArgs> = {
        [P in keyof T & keyof AggregateCourse]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateCourse[P]>
      : GetScalarType<T[P], AggregateCourse[P]>
  }




  export type CourseGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CourseWhereInput
    orderBy?: CourseOrderByWithAggregationInput | CourseOrderByWithAggregationInput[]
    by: CourseScalarFieldEnum[] | CourseScalarFieldEnum
    having?: CourseScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: CourseCountAggregateInputType | true
    _avg?: CourseAvgAggregateInputType
    _sum?: CourseSumAggregateInputType
    _min?: CourseMinAggregateInputType
    _max?: CourseMaxAggregateInputType
  }

  export type CourseGroupByOutputType = {
    id: string
    code: string
    nameNo: string
    nameEn: string | null
    credits: number | null
    studyLevel: $Enums.StudyLevel
    gradeType: $Enums.GradeType
    firstYearTaught: number
    lastYearTaught: number | null
    contentNo: string | null
    contentEn: string | null
    teachingMethodsNo: string | null
    teachingMethodsEn: string | null
    learningOutcomesNo: string | null
    learningOutcomesEn: string | null
    examTypeNo: string | null
    examTypeEn: string | null
    candidateCount: number
    averageGrade: number
    passRate: number
    createdAt: Date
    updatedAt: Date
    taughtSemesters: $Enums.Semester[]
    teachingLanguages: $Enums.TeachingLanguage[]
    campuses: $Enums.Campus[]
    facultyId: string | null
    departmentId: string | null
    latestYearCheckedForNtnuData: number | null
    _count: CourseCountAggregateOutputType | null
    _avg: CourseAvgAggregateOutputType | null
    _sum: CourseSumAggregateOutputType | null
    _min: CourseMinAggregateOutputType | null
    _max: CourseMaxAggregateOutputType | null
  }

  type GetCourseGroupByPayload<T extends CourseGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<CourseGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof CourseGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], CourseGroupByOutputType[P]>
            : GetScalarType<T[P], CourseGroupByOutputType[P]>
        }
      >
    >


  export type CourseSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    code?: boolean
    nameNo?: boolean
    nameEn?: boolean
    credits?: boolean
    studyLevel?: boolean
    gradeType?: boolean
    firstYearTaught?: boolean
    lastYearTaught?: boolean
    contentNo?: boolean
    contentEn?: boolean
    teachingMethodsNo?: boolean
    teachingMethodsEn?: boolean
    learningOutcomesNo?: boolean
    learningOutcomesEn?: boolean
    examTypeNo?: boolean
    examTypeEn?: boolean
    candidateCount?: boolean
    averageGrade?: boolean
    passRate?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    taughtSemesters?: boolean
    teachingLanguages?: boolean
    campuses?: boolean
    facultyId?: boolean
    departmentId?: boolean
    latestYearCheckedForNtnuData?: boolean
    grades?: boolean | Course$gradesArgs<ExtArgs>
    faculty?: boolean | Course$facultyArgs<ExtArgs>
    department?: boolean | Course$departmentArgs<ExtArgs>
    _count?: boolean | CourseCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["course"]>

  export type CourseSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    code?: boolean
    nameNo?: boolean
    nameEn?: boolean
    credits?: boolean
    studyLevel?: boolean
    gradeType?: boolean
    firstYearTaught?: boolean
    lastYearTaught?: boolean
    contentNo?: boolean
    contentEn?: boolean
    teachingMethodsNo?: boolean
    teachingMethodsEn?: boolean
    learningOutcomesNo?: boolean
    learningOutcomesEn?: boolean
    examTypeNo?: boolean
    examTypeEn?: boolean
    candidateCount?: boolean
    averageGrade?: boolean
    passRate?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    taughtSemesters?: boolean
    teachingLanguages?: boolean
    campuses?: boolean
    facultyId?: boolean
    departmentId?: boolean
    latestYearCheckedForNtnuData?: boolean
    faculty?: boolean | Course$facultyArgs<ExtArgs>
    department?: boolean | Course$departmentArgs<ExtArgs>
  }, ExtArgs["result"]["course"]>

  export type CourseSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    code?: boolean
    nameNo?: boolean
    nameEn?: boolean
    credits?: boolean
    studyLevel?: boolean
    gradeType?: boolean
    firstYearTaught?: boolean
    lastYearTaught?: boolean
    contentNo?: boolean
    contentEn?: boolean
    teachingMethodsNo?: boolean
    teachingMethodsEn?: boolean
    learningOutcomesNo?: boolean
    learningOutcomesEn?: boolean
    examTypeNo?: boolean
    examTypeEn?: boolean
    candidateCount?: boolean
    averageGrade?: boolean
    passRate?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    taughtSemesters?: boolean
    teachingLanguages?: boolean
    campuses?: boolean
    facultyId?: boolean
    departmentId?: boolean
    latestYearCheckedForNtnuData?: boolean
    faculty?: boolean | Course$facultyArgs<ExtArgs>
    department?: boolean | Course$departmentArgs<ExtArgs>
  }, ExtArgs["result"]["course"]>

  export type CourseSelectScalar = {
    id?: boolean
    code?: boolean
    nameNo?: boolean
    nameEn?: boolean
    credits?: boolean
    studyLevel?: boolean
    gradeType?: boolean
    firstYearTaught?: boolean
    lastYearTaught?: boolean
    contentNo?: boolean
    contentEn?: boolean
    teachingMethodsNo?: boolean
    teachingMethodsEn?: boolean
    learningOutcomesNo?: boolean
    learningOutcomesEn?: boolean
    examTypeNo?: boolean
    examTypeEn?: boolean
    candidateCount?: boolean
    averageGrade?: boolean
    passRate?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    taughtSemesters?: boolean
    teachingLanguages?: boolean
    campuses?: boolean
    facultyId?: boolean
    departmentId?: boolean
    latestYearCheckedForNtnuData?: boolean
  }

  export type CourseOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "code" | "nameNo" | "nameEn" | "credits" | "studyLevel" | "gradeType" | "firstYearTaught" | "lastYearTaught" | "contentNo" | "contentEn" | "teachingMethodsNo" | "teachingMethodsEn" | "learningOutcomesNo" | "learningOutcomesEn" | "examTypeNo" | "examTypeEn" | "candidateCount" | "averageGrade" | "passRate" | "createdAt" | "updatedAt" | "taughtSemesters" | "teachingLanguages" | "campuses" | "facultyId" | "departmentId" | "latestYearCheckedForNtnuData", ExtArgs["result"]["course"]>
  export type CourseInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    grades?: boolean | Course$gradesArgs<ExtArgs>
    faculty?: boolean | Course$facultyArgs<ExtArgs>
    department?: boolean | Course$departmentArgs<ExtArgs>
    _count?: boolean | CourseCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type CourseIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    faculty?: boolean | Course$facultyArgs<ExtArgs>
    department?: boolean | Course$departmentArgs<ExtArgs>
  }
  export type CourseIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    faculty?: boolean | Course$facultyArgs<ExtArgs>
    department?: boolean | Course$departmentArgs<ExtArgs>
  }

  export type $CoursePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Course"
    objects: {
      grades: Prisma.$GradePayload<ExtArgs>[]
      faculty: Prisma.$FacultyPayload<ExtArgs> | null
      department: Prisma.$DepartmentPayload<ExtArgs> | null
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      code: string
      nameNo: string
      nameEn: string | null
      credits: number | null
      studyLevel: $Enums.StudyLevel
      gradeType: $Enums.GradeType
      firstYearTaught: number
      lastYearTaught: number | null
      contentNo: string | null
      contentEn: string | null
      teachingMethodsNo: string | null
      teachingMethodsEn: string | null
      learningOutcomesNo: string | null
      learningOutcomesEn: string | null
      examTypeNo: string | null
      examTypeEn: string | null
      candidateCount: number
      averageGrade: number
      passRate: number
      createdAt: Date
      updatedAt: Date
      taughtSemesters: $Enums.Semester[]
      teachingLanguages: $Enums.TeachingLanguage[]
      campuses: $Enums.Campus[]
      facultyId: string | null
      departmentId: string | null
      /**
       * Metadata used to speed up sync by limiting how far back the scraper has to check for changes
       */
      latestYearCheckedForNtnuData: number | null
    }, ExtArgs["result"]["course"]>
    composites: {}
  }

  type CourseGetPayload<S extends boolean | null | undefined | CourseDefaultArgs> = $Result.GetResult<Prisma.$CoursePayload, S>

  type CourseCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<CourseFindManyArgs, 'select' | 'include' | 'distinct' | 'omit' | 'relationLoadStrategy'> & {
      select?: CourseCountAggregateInputType | true
    }

  export interface CourseDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Course'], meta: { name: 'Course' } }
    /**
     * Find zero or one Course that matches the filter.
     * @param {CourseFindUniqueArgs} args - Arguments to find a Course
     * @example
     * // Get one Course
     * const course = await prisma.course.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends CourseFindUniqueArgs>(args: SelectSubset<T, CourseFindUniqueArgs<ExtArgs>>): Prisma__CourseClient<$Result.GetResult<Prisma.$CoursePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Course that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {CourseFindUniqueOrThrowArgs} args - Arguments to find a Course
     * @example
     * // Get one Course
     * const course = await prisma.course.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends CourseFindUniqueOrThrowArgs>(args: SelectSubset<T, CourseFindUniqueOrThrowArgs<ExtArgs>>): Prisma__CourseClient<$Result.GetResult<Prisma.$CoursePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Course that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CourseFindFirstArgs} args - Arguments to find a Course
     * @example
     * // Get one Course
     * const course = await prisma.course.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends CourseFindFirstArgs>(args?: SelectSubset<T, CourseFindFirstArgs<ExtArgs>>): Prisma__CourseClient<$Result.GetResult<Prisma.$CoursePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Course that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CourseFindFirstOrThrowArgs} args - Arguments to find a Course
     * @example
     * // Get one Course
     * const course = await prisma.course.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends CourseFindFirstOrThrowArgs>(args?: SelectSubset<T, CourseFindFirstOrThrowArgs<ExtArgs>>): Prisma__CourseClient<$Result.GetResult<Prisma.$CoursePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Courses that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CourseFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Courses
     * const courses = await prisma.course.findMany()
     * 
     * // Get first 10 Courses
     * const courses = await prisma.course.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const courseWithIdOnly = await prisma.course.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends CourseFindManyArgs>(args?: SelectSubset<T, CourseFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CoursePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Course.
     * @param {CourseCreateArgs} args - Arguments to create a Course.
     * @example
     * // Create one Course
     * const Course = await prisma.course.create({
     *   data: {
     *     // ... data to create a Course
     *   }
     * })
     * 
     */
    create<T extends CourseCreateArgs>(args: SelectSubset<T, CourseCreateArgs<ExtArgs>>): Prisma__CourseClient<$Result.GetResult<Prisma.$CoursePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Courses.
     * @param {CourseCreateManyArgs} args - Arguments to create many Courses.
     * @example
     * // Create many Courses
     * const course = await prisma.course.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends CourseCreateManyArgs>(args?: SelectSubset<T, CourseCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Courses and returns the data saved in the database.
     * @param {CourseCreateManyAndReturnArgs} args - Arguments to create many Courses.
     * @example
     * // Create many Courses
     * const course = await prisma.course.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Courses and only return the `id`
     * const courseWithIdOnly = await prisma.course.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends CourseCreateManyAndReturnArgs>(args?: SelectSubset<T, CourseCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CoursePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Course.
     * @param {CourseDeleteArgs} args - Arguments to delete one Course.
     * @example
     * // Delete one Course
     * const Course = await prisma.course.delete({
     *   where: {
     *     // ... filter to delete one Course
     *   }
     * })
     * 
     */
    delete<T extends CourseDeleteArgs>(args: SelectSubset<T, CourseDeleteArgs<ExtArgs>>): Prisma__CourseClient<$Result.GetResult<Prisma.$CoursePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Course.
     * @param {CourseUpdateArgs} args - Arguments to update one Course.
     * @example
     * // Update one Course
     * const course = await prisma.course.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends CourseUpdateArgs>(args: SelectSubset<T, CourseUpdateArgs<ExtArgs>>): Prisma__CourseClient<$Result.GetResult<Prisma.$CoursePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Courses.
     * @param {CourseDeleteManyArgs} args - Arguments to filter Courses to delete.
     * @example
     * // Delete a few Courses
     * const { count } = await prisma.course.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends CourseDeleteManyArgs>(args?: SelectSubset<T, CourseDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Courses.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CourseUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Courses
     * const course = await prisma.course.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends CourseUpdateManyArgs>(args: SelectSubset<T, CourseUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Courses and returns the data updated in the database.
     * @param {CourseUpdateManyAndReturnArgs} args - Arguments to update many Courses.
     * @example
     * // Update many Courses
     * const course = await prisma.course.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Courses and only return the `id`
     * const courseWithIdOnly = await prisma.course.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends CourseUpdateManyAndReturnArgs>(args: SelectSubset<T, CourseUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CoursePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Course.
     * @param {CourseUpsertArgs} args - Arguments to update or create a Course.
     * @example
     * // Update or create a Course
     * const course = await prisma.course.upsert({
     *   create: {
     *     // ... data to create a Course
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Course we want to update
     *   }
     * })
     */
    upsert<T extends CourseUpsertArgs>(args: SelectSubset<T, CourseUpsertArgs<ExtArgs>>): Prisma__CourseClient<$Result.GetResult<Prisma.$CoursePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Courses.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CourseCountArgs} args - Arguments to filter Courses to count.
     * @example
     * // Count the number of Courses
     * const count = await prisma.course.count({
     *   where: {
     *     // ... the filter for the Courses we want to count
     *   }
     * })
    **/
    count<T extends CourseCountArgs>(
      args?: Subset<T, CourseCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], CourseCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Course.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CourseAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends CourseAggregateArgs>(args: Subset<T, CourseAggregateArgs>): Prisma.PrismaPromise<GetCourseAggregateType<T>>

    /**
     * Group by Course.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CourseGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends CourseGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: CourseGroupByArgs['orderBy'] }
        : { orderBy?: CourseGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, CourseGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetCourseGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Course model
   */
  readonly fields: CourseFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Course.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__CourseClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    grades<T extends Course$gradesArgs<ExtArgs> = {}>(args?: Subset<T, Course$gradesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$GradePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    faculty<T extends Course$facultyArgs<ExtArgs> = {}>(args?: Subset<T, Course$facultyArgs<ExtArgs>>): Prisma__FacultyClient<$Result.GetResult<Prisma.$FacultyPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    department<T extends Course$departmentArgs<ExtArgs> = {}>(args?: Subset<T, Course$departmentArgs<ExtArgs>>): Prisma__DepartmentClient<$Result.GetResult<Prisma.$DepartmentPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Course model
   */
  interface CourseFieldRefs {
    readonly id: FieldRef<"Course", 'String'>
    readonly code: FieldRef<"Course", 'String'>
    readonly nameNo: FieldRef<"Course", 'String'>
    readonly nameEn: FieldRef<"Course", 'String'>
    readonly credits: FieldRef<"Course", 'Float'>
    readonly studyLevel: FieldRef<"Course", 'StudyLevel'>
    readonly gradeType: FieldRef<"Course", 'GradeType'>
    readonly firstYearTaught: FieldRef<"Course", 'Int'>
    readonly lastYearTaught: FieldRef<"Course", 'Int'>
    readonly contentNo: FieldRef<"Course", 'String'>
    readonly contentEn: FieldRef<"Course", 'String'>
    readonly teachingMethodsNo: FieldRef<"Course", 'String'>
    readonly teachingMethodsEn: FieldRef<"Course", 'String'>
    readonly learningOutcomesNo: FieldRef<"Course", 'String'>
    readonly learningOutcomesEn: FieldRef<"Course", 'String'>
    readonly examTypeNo: FieldRef<"Course", 'String'>
    readonly examTypeEn: FieldRef<"Course", 'String'>
    readonly candidateCount: FieldRef<"Course", 'Int'>
    readonly averageGrade: FieldRef<"Course", 'Float'>
    readonly passRate: FieldRef<"Course", 'Float'>
    readonly createdAt: FieldRef<"Course", 'DateTime'>
    readonly updatedAt: FieldRef<"Course", 'DateTime'>
    readonly taughtSemesters: FieldRef<"Course", 'Semester[]'>
    readonly teachingLanguages: FieldRef<"Course", 'TeachingLanguage[]'>
    readonly campuses: FieldRef<"Course", 'Campus[]'>
    readonly facultyId: FieldRef<"Course", 'String'>
    readonly departmentId: FieldRef<"Course", 'String'>
    readonly latestYearCheckedForNtnuData: FieldRef<"Course", 'Int'>
  }
    

  // Custom InputTypes
  /**
   * Course findUnique
   */
  export type CourseFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Course
     */
    select?: CourseSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Course
     */
    omit?: CourseOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CourseInclude<ExtArgs> | null
    /**
     * Filter, which Course to fetch.
     */
    where: CourseWhereUniqueInput
    relationLoadStrategy?: RelationLoadStrategy
  }

  /**
   * Course findUniqueOrThrow
   */
  export type CourseFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Course
     */
    select?: CourseSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Course
     */
    omit?: CourseOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CourseInclude<ExtArgs> | null
    /**
     * Filter, which Course to fetch.
     */
    where: CourseWhereUniqueInput
    relationLoadStrategy?: RelationLoadStrategy
  }

  /**
   * Course findFirst
   */
  export type CourseFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Course
     */
    select?: CourseSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Course
     */
    omit?: CourseOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CourseInclude<ExtArgs> | null
    /**
     * Filter, which Course to fetch.
     */
    where?: CourseWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Courses to fetch.
     */
    orderBy?: CourseOrderByWithRelationInput | CourseOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Courses.
     */
    cursor?: CourseWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Courses from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Courses.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Courses.
     */
    distinct?: CourseScalarFieldEnum | CourseScalarFieldEnum[]
    relationLoadStrategy?: RelationLoadStrategy
  }

  /**
   * Course findFirstOrThrow
   */
  export type CourseFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Course
     */
    select?: CourseSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Course
     */
    omit?: CourseOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CourseInclude<ExtArgs> | null
    /**
     * Filter, which Course to fetch.
     */
    where?: CourseWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Courses to fetch.
     */
    orderBy?: CourseOrderByWithRelationInput | CourseOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Courses.
     */
    cursor?: CourseWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Courses from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Courses.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Courses.
     */
    distinct?: CourseScalarFieldEnum | CourseScalarFieldEnum[]
    relationLoadStrategy?: RelationLoadStrategy
  }

  /**
   * Course findMany
   */
  export type CourseFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Course
     */
    select?: CourseSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Course
     */
    omit?: CourseOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CourseInclude<ExtArgs> | null
    /**
     * Filter, which Courses to fetch.
     */
    where?: CourseWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Courses to fetch.
     */
    orderBy?: CourseOrderByWithRelationInput | CourseOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Courses.
     */
    cursor?: CourseWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Courses from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Courses.
     */
    skip?: number
    distinct?: CourseScalarFieldEnum | CourseScalarFieldEnum[]
    relationLoadStrategy?: RelationLoadStrategy
  }

  /**
   * Course create
   */
  export type CourseCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Course
     */
    select?: CourseSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Course
     */
    omit?: CourseOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CourseInclude<ExtArgs> | null
    /**
     * The data needed to create a Course.
     */
    data: XOR<CourseCreateInput, CourseUncheckedCreateInput>
    relationLoadStrategy?: RelationLoadStrategy
  }

  /**
   * Course createMany
   */
  export type CourseCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Courses.
     */
    data: CourseCreateManyInput | CourseCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Course createManyAndReturn
   */
  export type CourseCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Course
     */
    select?: CourseSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Course
     */
    omit?: CourseOmit<ExtArgs> | null
    /**
     * The data used to create many Courses.
     */
    data: CourseCreateManyInput | CourseCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CourseIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Course update
   */
  export type CourseUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Course
     */
    select?: CourseSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Course
     */
    omit?: CourseOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CourseInclude<ExtArgs> | null
    /**
     * The data needed to update a Course.
     */
    data: XOR<CourseUpdateInput, CourseUncheckedUpdateInput>
    /**
     * Choose, which Course to update.
     */
    where: CourseWhereUniqueInput
    relationLoadStrategy?: RelationLoadStrategy
  }

  /**
   * Course updateMany
   */
  export type CourseUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Courses.
     */
    data: XOR<CourseUpdateManyMutationInput, CourseUncheckedUpdateManyInput>
    /**
     * Filter which Courses to update
     */
    where?: CourseWhereInput
    /**
     * Limit how many Courses to update.
     */
    limit?: number
  }

  /**
   * Course updateManyAndReturn
   */
  export type CourseUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Course
     */
    select?: CourseSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Course
     */
    omit?: CourseOmit<ExtArgs> | null
    /**
     * The data used to update Courses.
     */
    data: XOR<CourseUpdateManyMutationInput, CourseUncheckedUpdateManyInput>
    /**
     * Filter which Courses to update
     */
    where?: CourseWhereInput
    /**
     * Limit how many Courses to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CourseIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Course upsert
   */
  export type CourseUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Course
     */
    select?: CourseSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Course
     */
    omit?: CourseOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CourseInclude<ExtArgs> | null
    /**
     * The filter to search for the Course to update in case it exists.
     */
    where: CourseWhereUniqueInput
    /**
     * In case the Course found by the `where` argument doesn't exist, create a new Course with this data.
     */
    create: XOR<CourseCreateInput, CourseUncheckedCreateInput>
    /**
     * In case the Course was found with the provided `where` argument, update it with this data.
     */
    update: XOR<CourseUpdateInput, CourseUncheckedUpdateInput>
    relationLoadStrategy?: RelationLoadStrategy
  }

  /**
   * Course delete
   */
  export type CourseDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Course
     */
    select?: CourseSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Course
     */
    omit?: CourseOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CourseInclude<ExtArgs> | null
    /**
     * Filter which Course to delete.
     */
    where: CourseWhereUniqueInput
    relationLoadStrategy?: RelationLoadStrategy
  }

  /**
   * Course deleteMany
   */
  export type CourseDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Courses to delete
     */
    where?: CourseWhereInput
    /**
     * Limit how many Courses to delete.
     */
    limit?: number
  }

  /**
   * Course.grades
   */
  export type Course$gradesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Grade
     */
    select?: GradeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Grade
     */
    omit?: GradeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GradeInclude<ExtArgs> | null
    where?: GradeWhereInput
    orderBy?: GradeOrderByWithRelationInput | GradeOrderByWithRelationInput[]
    cursor?: GradeWhereUniqueInput
    take?: number
    skip?: number
    distinct?: GradeScalarFieldEnum | GradeScalarFieldEnum[]
  }

  /**
   * Course.faculty
   */
  export type Course$facultyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Faculty
     */
    select?: FacultySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Faculty
     */
    omit?: FacultyOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FacultyInclude<ExtArgs> | null
    where?: FacultyWhereInput
  }

  /**
   * Course.department
   */
  export type Course$departmentArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Department
     */
    select?: DepartmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Department
     */
    omit?: DepartmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DepartmentInclude<ExtArgs> | null
    where?: DepartmentWhereInput
  }

  /**
   * Course without action
   */
  export type CourseDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Course
     */
    select?: CourseSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Course
     */
    omit?: CourseOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CourseInclude<ExtArgs> | null
  }


  /**
   * Model Grade
   */

  export type AggregateGrade = {
    _count: GradeCountAggregateOutputType | null
    _avg: GradeAvgAggregateOutputType | null
    _sum: GradeSumAggregateOutputType | null
    _min: GradeMinAggregateOutputType | null
    _max: GradeMaxAggregateOutputType | null
  }

  export type GradeAvgAggregateOutputType = {
    gradeACount: number | null
    gradeBCount: number | null
    gradeCCount: number | null
    gradeDCount: number | null
    gradeECount: number | null
    gradeFCount: number | null
    passedCount: number | null
    failedCount: number | null
    year: number | null
  }

  export type GradeSumAggregateOutputType = {
    gradeACount: number | null
    gradeBCount: number | null
    gradeCCount: number | null
    gradeDCount: number | null
    gradeECount: number | null
    gradeFCount: number | null
    passedCount: number | null
    failedCount: number | null
    year: number | null
  }

  export type GradeMinAggregateOutputType = {
    id: string | null
    gradeACount: number | null
    gradeBCount: number | null
    gradeCCount: number | null
    gradeDCount: number | null
    gradeECount: number | null
    gradeFCount: number | null
    passedCount: number | null
    failedCount: number | null
    courseId: string | null
    semester: $Enums.Semester | null
    year: number | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type GradeMaxAggregateOutputType = {
    id: string | null
    gradeACount: number | null
    gradeBCount: number | null
    gradeCCount: number | null
    gradeDCount: number | null
    gradeECount: number | null
    gradeFCount: number | null
    passedCount: number | null
    failedCount: number | null
    courseId: string | null
    semester: $Enums.Semester | null
    year: number | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type GradeCountAggregateOutputType = {
    id: number
    gradeACount: number
    gradeBCount: number
    gradeCCount: number
    gradeDCount: number
    gradeECount: number
    gradeFCount: number
    passedCount: number
    failedCount: number
    courseId: number
    semester: number
    year: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type GradeAvgAggregateInputType = {
    gradeACount?: true
    gradeBCount?: true
    gradeCCount?: true
    gradeDCount?: true
    gradeECount?: true
    gradeFCount?: true
    passedCount?: true
    failedCount?: true
    year?: true
  }

  export type GradeSumAggregateInputType = {
    gradeACount?: true
    gradeBCount?: true
    gradeCCount?: true
    gradeDCount?: true
    gradeECount?: true
    gradeFCount?: true
    passedCount?: true
    failedCount?: true
    year?: true
  }

  export type GradeMinAggregateInputType = {
    id?: true
    gradeACount?: true
    gradeBCount?: true
    gradeCCount?: true
    gradeDCount?: true
    gradeECount?: true
    gradeFCount?: true
    passedCount?: true
    failedCount?: true
    courseId?: true
    semester?: true
    year?: true
    createdAt?: true
    updatedAt?: true
  }

  export type GradeMaxAggregateInputType = {
    id?: true
    gradeACount?: true
    gradeBCount?: true
    gradeCCount?: true
    gradeDCount?: true
    gradeECount?: true
    gradeFCount?: true
    passedCount?: true
    failedCount?: true
    courseId?: true
    semester?: true
    year?: true
    createdAt?: true
    updatedAt?: true
  }

  export type GradeCountAggregateInputType = {
    id?: true
    gradeACount?: true
    gradeBCount?: true
    gradeCCount?: true
    gradeDCount?: true
    gradeECount?: true
    gradeFCount?: true
    passedCount?: true
    failedCount?: true
    courseId?: true
    semester?: true
    year?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type GradeAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Grade to aggregate.
     */
    where?: GradeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Grades to fetch.
     */
    orderBy?: GradeOrderByWithRelationInput | GradeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: GradeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Grades from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Grades.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Grades
    **/
    _count?: true | GradeCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: GradeAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: GradeSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: GradeMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: GradeMaxAggregateInputType
  }

  export type GetGradeAggregateType<T extends GradeAggregateArgs> = {
        [P in keyof T & keyof AggregateGrade]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateGrade[P]>
      : GetScalarType<T[P], AggregateGrade[P]>
  }




  export type GradeGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: GradeWhereInput
    orderBy?: GradeOrderByWithAggregationInput | GradeOrderByWithAggregationInput[]
    by: GradeScalarFieldEnum[] | GradeScalarFieldEnum
    having?: GradeScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: GradeCountAggregateInputType | true
    _avg?: GradeAvgAggregateInputType
    _sum?: GradeSumAggregateInputType
    _min?: GradeMinAggregateInputType
    _max?: GradeMaxAggregateInputType
  }

  export type GradeGroupByOutputType = {
    id: string
    gradeACount: number
    gradeBCount: number
    gradeCCount: number
    gradeDCount: number
    gradeECount: number
    gradeFCount: number
    passedCount: number
    failedCount: number
    courseId: string
    semester: $Enums.Semester
    year: number
    createdAt: Date
    updatedAt: Date
    _count: GradeCountAggregateOutputType | null
    _avg: GradeAvgAggregateOutputType | null
    _sum: GradeSumAggregateOutputType | null
    _min: GradeMinAggregateOutputType | null
    _max: GradeMaxAggregateOutputType | null
  }

  type GetGradeGroupByPayload<T extends GradeGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<GradeGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof GradeGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], GradeGroupByOutputType[P]>
            : GetScalarType<T[P], GradeGroupByOutputType[P]>
        }
      >
    >


  export type GradeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    gradeACount?: boolean
    gradeBCount?: boolean
    gradeCCount?: boolean
    gradeDCount?: boolean
    gradeECount?: boolean
    gradeFCount?: boolean
    passedCount?: boolean
    failedCount?: boolean
    courseId?: boolean
    semester?: boolean
    year?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    course?: boolean | CourseDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["grade"]>

  export type GradeSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    gradeACount?: boolean
    gradeBCount?: boolean
    gradeCCount?: boolean
    gradeDCount?: boolean
    gradeECount?: boolean
    gradeFCount?: boolean
    passedCount?: boolean
    failedCount?: boolean
    courseId?: boolean
    semester?: boolean
    year?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    course?: boolean | CourseDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["grade"]>

  export type GradeSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    gradeACount?: boolean
    gradeBCount?: boolean
    gradeCCount?: boolean
    gradeDCount?: boolean
    gradeECount?: boolean
    gradeFCount?: boolean
    passedCount?: boolean
    failedCount?: boolean
    courseId?: boolean
    semester?: boolean
    year?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    course?: boolean | CourseDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["grade"]>

  export type GradeSelectScalar = {
    id?: boolean
    gradeACount?: boolean
    gradeBCount?: boolean
    gradeCCount?: boolean
    gradeDCount?: boolean
    gradeECount?: boolean
    gradeFCount?: boolean
    passedCount?: boolean
    failedCount?: boolean
    courseId?: boolean
    semester?: boolean
    year?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type GradeOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "gradeACount" | "gradeBCount" | "gradeCCount" | "gradeDCount" | "gradeECount" | "gradeFCount" | "passedCount" | "failedCount" | "courseId" | "semester" | "year" | "createdAt" | "updatedAt", ExtArgs["result"]["grade"]>
  export type GradeInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    course?: boolean | CourseDefaultArgs<ExtArgs>
  }
  export type GradeIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    course?: boolean | CourseDefaultArgs<ExtArgs>
  }
  export type GradeIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    course?: boolean | CourseDefaultArgs<ExtArgs>
  }

  export type $GradePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Grade"
    objects: {
      course: Prisma.$CoursePayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      gradeACount: number
      gradeBCount: number
      gradeCCount: number
      gradeDCount: number
      gradeECount: number
      gradeFCount: number
      passedCount: number
      failedCount: number
      courseId: string
      semester: $Enums.Semester
      year: number
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["grade"]>
    composites: {}
  }

  type GradeGetPayload<S extends boolean | null | undefined | GradeDefaultArgs> = $Result.GetResult<Prisma.$GradePayload, S>

  type GradeCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<GradeFindManyArgs, 'select' | 'include' | 'distinct' | 'omit' | 'relationLoadStrategy'> & {
      select?: GradeCountAggregateInputType | true
    }

  export interface GradeDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Grade'], meta: { name: 'Grade' } }
    /**
     * Find zero or one Grade that matches the filter.
     * @param {GradeFindUniqueArgs} args - Arguments to find a Grade
     * @example
     * // Get one Grade
     * const grade = await prisma.grade.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends GradeFindUniqueArgs>(args: SelectSubset<T, GradeFindUniqueArgs<ExtArgs>>): Prisma__GradeClient<$Result.GetResult<Prisma.$GradePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Grade that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {GradeFindUniqueOrThrowArgs} args - Arguments to find a Grade
     * @example
     * // Get one Grade
     * const grade = await prisma.grade.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends GradeFindUniqueOrThrowArgs>(args: SelectSubset<T, GradeFindUniqueOrThrowArgs<ExtArgs>>): Prisma__GradeClient<$Result.GetResult<Prisma.$GradePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Grade that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GradeFindFirstArgs} args - Arguments to find a Grade
     * @example
     * // Get one Grade
     * const grade = await prisma.grade.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends GradeFindFirstArgs>(args?: SelectSubset<T, GradeFindFirstArgs<ExtArgs>>): Prisma__GradeClient<$Result.GetResult<Prisma.$GradePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Grade that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GradeFindFirstOrThrowArgs} args - Arguments to find a Grade
     * @example
     * // Get one Grade
     * const grade = await prisma.grade.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends GradeFindFirstOrThrowArgs>(args?: SelectSubset<T, GradeFindFirstOrThrowArgs<ExtArgs>>): Prisma__GradeClient<$Result.GetResult<Prisma.$GradePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Grades that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GradeFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Grades
     * const grades = await prisma.grade.findMany()
     * 
     * // Get first 10 Grades
     * const grades = await prisma.grade.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const gradeWithIdOnly = await prisma.grade.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends GradeFindManyArgs>(args?: SelectSubset<T, GradeFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$GradePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Grade.
     * @param {GradeCreateArgs} args - Arguments to create a Grade.
     * @example
     * // Create one Grade
     * const Grade = await prisma.grade.create({
     *   data: {
     *     // ... data to create a Grade
     *   }
     * })
     * 
     */
    create<T extends GradeCreateArgs>(args: SelectSubset<T, GradeCreateArgs<ExtArgs>>): Prisma__GradeClient<$Result.GetResult<Prisma.$GradePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Grades.
     * @param {GradeCreateManyArgs} args - Arguments to create many Grades.
     * @example
     * // Create many Grades
     * const grade = await prisma.grade.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends GradeCreateManyArgs>(args?: SelectSubset<T, GradeCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Grades and returns the data saved in the database.
     * @param {GradeCreateManyAndReturnArgs} args - Arguments to create many Grades.
     * @example
     * // Create many Grades
     * const grade = await prisma.grade.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Grades and only return the `id`
     * const gradeWithIdOnly = await prisma.grade.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends GradeCreateManyAndReturnArgs>(args?: SelectSubset<T, GradeCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$GradePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Grade.
     * @param {GradeDeleteArgs} args - Arguments to delete one Grade.
     * @example
     * // Delete one Grade
     * const Grade = await prisma.grade.delete({
     *   where: {
     *     // ... filter to delete one Grade
     *   }
     * })
     * 
     */
    delete<T extends GradeDeleteArgs>(args: SelectSubset<T, GradeDeleteArgs<ExtArgs>>): Prisma__GradeClient<$Result.GetResult<Prisma.$GradePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Grade.
     * @param {GradeUpdateArgs} args - Arguments to update one Grade.
     * @example
     * // Update one Grade
     * const grade = await prisma.grade.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends GradeUpdateArgs>(args: SelectSubset<T, GradeUpdateArgs<ExtArgs>>): Prisma__GradeClient<$Result.GetResult<Prisma.$GradePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Grades.
     * @param {GradeDeleteManyArgs} args - Arguments to filter Grades to delete.
     * @example
     * // Delete a few Grades
     * const { count } = await prisma.grade.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends GradeDeleteManyArgs>(args?: SelectSubset<T, GradeDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Grades.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GradeUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Grades
     * const grade = await prisma.grade.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends GradeUpdateManyArgs>(args: SelectSubset<T, GradeUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Grades and returns the data updated in the database.
     * @param {GradeUpdateManyAndReturnArgs} args - Arguments to update many Grades.
     * @example
     * // Update many Grades
     * const grade = await prisma.grade.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Grades and only return the `id`
     * const gradeWithIdOnly = await prisma.grade.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends GradeUpdateManyAndReturnArgs>(args: SelectSubset<T, GradeUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$GradePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Grade.
     * @param {GradeUpsertArgs} args - Arguments to update or create a Grade.
     * @example
     * // Update or create a Grade
     * const grade = await prisma.grade.upsert({
     *   create: {
     *     // ... data to create a Grade
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Grade we want to update
     *   }
     * })
     */
    upsert<T extends GradeUpsertArgs>(args: SelectSubset<T, GradeUpsertArgs<ExtArgs>>): Prisma__GradeClient<$Result.GetResult<Prisma.$GradePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Grades.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GradeCountArgs} args - Arguments to filter Grades to count.
     * @example
     * // Count the number of Grades
     * const count = await prisma.grade.count({
     *   where: {
     *     // ... the filter for the Grades we want to count
     *   }
     * })
    **/
    count<T extends GradeCountArgs>(
      args?: Subset<T, GradeCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], GradeCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Grade.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GradeAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends GradeAggregateArgs>(args: Subset<T, GradeAggregateArgs>): Prisma.PrismaPromise<GetGradeAggregateType<T>>

    /**
     * Group by Grade.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GradeGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends GradeGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: GradeGroupByArgs['orderBy'] }
        : { orderBy?: GradeGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, GradeGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetGradeGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Grade model
   */
  readonly fields: GradeFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Grade.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__GradeClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    course<T extends CourseDefaultArgs<ExtArgs> = {}>(args?: Subset<T, CourseDefaultArgs<ExtArgs>>): Prisma__CourseClient<$Result.GetResult<Prisma.$CoursePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Grade model
   */
  interface GradeFieldRefs {
    readonly id: FieldRef<"Grade", 'String'>
    readonly gradeACount: FieldRef<"Grade", 'Int'>
    readonly gradeBCount: FieldRef<"Grade", 'Int'>
    readonly gradeCCount: FieldRef<"Grade", 'Int'>
    readonly gradeDCount: FieldRef<"Grade", 'Int'>
    readonly gradeECount: FieldRef<"Grade", 'Int'>
    readonly gradeFCount: FieldRef<"Grade", 'Int'>
    readonly passedCount: FieldRef<"Grade", 'Int'>
    readonly failedCount: FieldRef<"Grade", 'Int'>
    readonly courseId: FieldRef<"Grade", 'String'>
    readonly semester: FieldRef<"Grade", 'Semester'>
    readonly year: FieldRef<"Grade", 'Int'>
    readonly createdAt: FieldRef<"Grade", 'DateTime'>
    readonly updatedAt: FieldRef<"Grade", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Grade findUnique
   */
  export type GradeFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Grade
     */
    select?: GradeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Grade
     */
    omit?: GradeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GradeInclude<ExtArgs> | null
    /**
     * Filter, which Grade to fetch.
     */
    where: GradeWhereUniqueInput
    relationLoadStrategy?: RelationLoadStrategy
  }

  /**
   * Grade findUniqueOrThrow
   */
  export type GradeFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Grade
     */
    select?: GradeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Grade
     */
    omit?: GradeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GradeInclude<ExtArgs> | null
    /**
     * Filter, which Grade to fetch.
     */
    where: GradeWhereUniqueInput
    relationLoadStrategy?: RelationLoadStrategy
  }

  /**
   * Grade findFirst
   */
  export type GradeFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Grade
     */
    select?: GradeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Grade
     */
    omit?: GradeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GradeInclude<ExtArgs> | null
    /**
     * Filter, which Grade to fetch.
     */
    where?: GradeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Grades to fetch.
     */
    orderBy?: GradeOrderByWithRelationInput | GradeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Grades.
     */
    cursor?: GradeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Grades from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Grades.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Grades.
     */
    distinct?: GradeScalarFieldEnum | GradeScalarFieldEnum[]
    relationLoadStrategy?: RelationLoadStrategy
  }

  /**
   * Grade findFirstOrThrow
   */
  export type GradeFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Grade
     */
    select?: GradeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Grade
     */
    omit?: GradeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GradeInclude<ExtArgs> | null
    /**
     * Filter, which Grade to fetch.
     */
    where?: GradeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Grades to fetch.
     */
    orderBy?: GradeOrderByWithRelationInput | GradeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Grades.
     */
    cursor?: GradeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Grades from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Grades.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Grades.
     */
    distinct?: GradeScalarFieldEnum | GradeScalarFieldEnum[]
    relationLoadStrategy?: RelationLoadStrategy
  }

  /**
   * Grade findMany
   */
  export type GradeFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Grade
     */
    select?: GradeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Grade
     */
    omit?: GradeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GradeInclude<ExtArgs> | null
    /**
     * Filter, which Grades to fetch.
     */
    where?: GradeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Grades to fetch.
     */
    orderBy?: GradeOrderByWithRelationInput | GradeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Grades.
     */
    cursor?: GradeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Grades from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Grades.
     */
    skip?: number
    distinct?: GradeScalarFieldEnum | GradeScalarFieldEnum[]
    relationLoadStrategy?: RelationLoadStrategy
  }

  /**
   * Grade create
   */
  export type GradeCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Grade
     */
    select?: GradeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Grade
     */
    omit?: GradeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GradeInclude<ExtArgs> | null
    /**
     * The data needed to create a Grade.
     */
    data: XOR<GradeCreateInput, GradeUncheckedCreateInput>
    relationLoadStrategy?: RelationLoadStrategy
  }

  /**
   * Grade createMany
   */
  export type GradeCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Grades.
     */
    data: GradeCreateManyInput | GradeCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Grade createManyAndReturn
   */
  export type GradeCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Grade
     */
    select?: GradeSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Grade
     */
    omit?: GradeOmit<ExtArgs> | null
    /**
     * The data used to create many Grades.
     */
    data: GradeCreateManyInput | GradeCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GradeIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Grade update
   */
  export type GradeUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Grade
     */
    select?: GradeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Grade
     */
    omit?: GradeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GradeInclude<ExtArgs> | null
    /**
     * The data needed to update a Grade.
     */
    data: XOR<GradeUpdateInput, GradeUncheckedUpdateInput>
    /**
     * Choose, which Grade to update.
     */
    where: GradeWhereUniqueInput
    relationLoadStrategy?: RelationLoadStrategy
  }

  /**
   * Grade updateMany
   */
  export type GradeUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Grades.
     */
    data: XOR<GradeUpdateManyMutationInput, GradeUncheckedUpdateManyInput>
    /**
     * Filter which Grades to update
     */
    where?: GradeWhereInput
    /**
     * Limit how many Grades to update.
     */
    limit?: number
  }

  /**
   * Grade updateManyAndReturn
   */
  export type GradeUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Grade
     */
    select?: GradeSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Grade
     */
    omit?: GradeOmit<ExtArgs> | null
    /**
     * The data used to update Grades.
     */
    data: XOR<GradeUpdateManyMutationInput, GradeUncheckedUpdateManyInput>
    /**
     * Filter which Grades to update
     */
    where?: GradeWhereInput
    /**
     * Limit how many Grades to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GradeIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Grade upsert
   */
  export type GradeUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Grade
     */
    select?: GradeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Grade
     */
    omit?: GradeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GradeInclude<ExtArgs> | null
    /**
     * The filter to search for the Grade to update in case it exists.
     */
    where: GradeWhereUniqueInput
    /**
     * In case the Grade found by the `where` argument doesn't exist, create a new Grade with this data.
     */
    create: XOR<GradeCreateInput, GradeUncheckedCreateInput>
    /**
     * In case the Grade was found with the provided `where` argument, update it with this data.
     */
    update: XOR<GradeUpdateInput, GradeUncheckedUpdateInput>
    relationLoadStrategy?: RelationLoadStrategy
  }

  /**
   * Grade delete
   */
  export type GradeDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Grade
     */
    select?: GradeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Grade
     */
    omit?: GradeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GradeInclude<ExtArgs> | null
    /**
     * Filter which Grade to delete.
     */
    where: GradeWhereUniqueInput
    relationLoadStrategy?: RelationLoadStrategy
  }

  /**
   * Grade deleteMany
   */
  export type GradeDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Grades to delete
     */
    where?: GradeWhereInput
    /**
     * Limit how many Grades to delete.
     */
    limit?: number
  }

  /**
   * Grade without action
   */
  export type GradeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Grade
     */
    select?: GradeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Grade
     */
    omit?: GradeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GradeInclude<ExtArgs> | null
  }


  /**
   * Model Faculty
   */

  export type AggregateFaculty = {
    _count: FacultyCountAggregateOutputType | null
    _avg: FacultyAvgAggregateOutputType | null
    _sum: FacultySumAggregateOutputType | null
    _min: FacultyMinAggregateOutputType | null
    _max: FacultyMaxAggregateOutputType | null
  }

  export type FacultyAvgAggregateOutputType = {
    code: number | null
  }

  export type FacultySumAggregateOutputType = {
    code: number | null
  }

  export type FacultyMinAggregateOutputType = {
    id: string | null
    nameNo: string | null
    nameEn: string | null
    code: number | null
  }

  export type FacultyMaxAggregateOutputType = {
    id: string | null
    nameNo: string | null
    nameEn: string | null
    code: number | null
  }

  export type FacultyCountAggregateOutputType = {
    id: number
    nameNo: number
    nameEn: number
    code: number
    _all: number
  }


  export type FacultyAvgAggregateInputType = {
    code?: true
  }

  export type FacultySumAggregateInputType = {
    code?: true
  }

  export type FacultyMinAggregateInputType = {
    id?: true
    nameNo?: true
    nameEn?: true
    code?: true
  }

  export type FacultyMaxAggregateInputType = {
    id?: true
    nameNo?: true
    nameEn?: true
    code?: true
  }

  export type FacultyCountAggregateInputType = {
    id?: true
    nameNo?: true
    nameEn?: true
    code?: true
    _all?: true
  }

  export type FacultyAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Faculty to aggregate.
     */
    where?: FacultyWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Faculties to fetch.
     */
    orderBy?: FacultyOrderByWithRelationInput | FacultyOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: FacultyWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Faculties from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Faculties.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Faculties
    **/
    _count?: true | FacultyCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: FacultyAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: FacultySumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: FacultyMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: FacultyMaxAggregateInputType
  }

  export type GetFacultyAggregateType<T extends FacultyAggregateArgs> = {
        [P in keyof T & keyof AggregateFaculty]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateFaculty[P]>
      : GetScalarType<T[P], AggregateFaculty[P]>
  }




  export type FacultyGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: FacultyWhereInput
    orderBy?: FacultyOrderByWithAggregationInput | FacultyOrderByWithAggregationInput[]
    by: FacultyScalarFieldEnum[] | FacultyScalarFieldEnum
    having?: FacultyScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: FacultyCountAggregateInputType | true
    _avg?: FacultyAvgAggregateInputType
    _sum?: FacultySumAggregateInputType
    _min?: FacultyMinAggregateInputType
    _max?: FacultyMaxAggregateInputType
  }

  export type FacultyGroupByOutputType = {
    id: string
    nameNo: string
    nameEn: string
    code: number
    _count: FacultyCountAggregateOutputType | null
    _avg: FacultyAvgAggregateOutputType | null
    _sum: FacultySumAggregateOutputType | null
    _min: FacultyMinAggregateOutputType | null
    _max: FacultyMaxAggregateOutputType | null
  }

  type GetFacultyGroupByPayload<T extends FacultyGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<FacultyGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof FacultyGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], FacultyGroupByOutputType[P]>
            : GetScalarType<T[P], FacultyGroupByOutputType[P]>
        }
      >
    >


  export type FacultySelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    nameNo?: boolean
    nameEn?: boolean
    code?: boolean
    courses?: boolean | Faculty$coursesArgs<ExtArgs>
    departments?: boolean | Faculty$departmentsArgs<ExtArgs>
    _count?: boolean | FacultyCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["faculty"]>

  export type FacultySelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    nameNo?: boolean
    nameEn?: boolean
    code?: boolean
  }, ExtArgs["result"]["faculty"]>

  export type FacultySelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    nameNo?: boolean
    nameEn?: boolean
    code?: boolean
  }, ExtArgs["result"]["faculty"]>

  export type FacultySelectScalar = {
    id?: boolean
    nameNo?: boolean
    nameEn?: boolean
    code?: boolean
  }

  export type FacultyOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "nameNo" | "nameEn" | "code", ExtArgs["result"]["faculty"]>
  export type FacultyInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    courses?: boolean | Faculty$coursesArgs<ExtArgs>
    departments?: boolean | Faculty$departmentsArgs<ExtArgs>
    _count?: boolean | FacultyCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type FacultyIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type FacultyIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $FacultyPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Faculty"
    objects: {
      courses: Prisma.$CoursePayload<ExtArgs>[]
      departments: Prisma.$DepartmentPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      nameNo: string
      nameEn: string
      /**
       * DBH code for faculty, for example "230000"
       */
      code: number
    }, ExtArgs["result"]["faculty"]>
    composites: {}
  }

  type FacultyGetPayload<S extends boolean | null | undefined | FacultyDefaultArgs> = $Result.GetResult<Prisma.$FacultyPayload, S>

  type FacultyCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<FacultyFindManyArgs, 'select' | 'include' | 'distinct' | 'omit' | 'relationLoadStrategy'> & {
      select?: FacultyCountAggregateInputType | true
    }

  export interface FacultyDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Faculty'], meta: { name: 'Faculty' } }
    /**
     * Find zero or one Faculty that matches the filter.
     * @param {FacultyFindUniqueArgs} args - Arguments to find a Faculty
     * @example
     * // Get one Faculty
     * const faculty = await prisma.faculty.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends FacultyFindUniqueArgs>(args: SelectSubset<T, FacultyFindUniqueArgs<ExtArgs>>): Prisma__FacultyClient<$Result.GetResult<Prisma.$FacultyPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Faculty that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {FacultyFindUniqueOrThrowArgs} args - Arguments to find a Faculty
     * @example
     * // Get one Faculty
     * const faculty = await prisma.faculty.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends FacultyFindUniqueOrThrowArgs>(args: SelectSubset<T, FacultyFindUniqueOrThrowArgs<ExtArgs>>): Prisma__FacultyClient<$Result.GetResult<Prisma.$FacultyPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Faculty that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FacultyFindFirstArgs} args - Arguments to find a Faculty
     * @example
     * // Get one Faculty
     * const faculty = await prisma.faculty.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends FacultyFindFirstArgs>(args?: SelectSubset<T, FacultyFindFirstArgs<ExtArgs>>): Prisma__FacultyClient<$Result.GetResult<Prisma.$FacultyPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Faculty that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FacultyFindFirstOrThrowArgs} args - Arguments to find a Faculty
     * @example
     * // Get one Faculty
     * const faculty = await prisma.faculty.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends FacultyFindFirstOrThrowArgs>(args?: SelectSubset<T, FacultyFindFirstOrThrowArgs<ExtArgs>>): Prisma__FacultyClient<$Result.GetResult<Prisma.$FacultyPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Faculties that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FacultyFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Faculties
     * const faculties = await prisma.faculty.findMany()
     * 
     * // Get first 10 Faculties
     * const faculties = await prisma.faculty.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const facultyWithIdOnly = await prisma.faculty.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends FacultyFindManyArgs>(args?: SelectSubset<T, FacultyFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$FacultyPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Faculty.
     * @param {FacultyCreateArgs} args - Arguments to create a Faculty.
     * @example
     * // Create one Faculty
     * const Faculty = await prisma.faculty.create({
     *   data: {
     *     // ... data to create a Faculty
     *   }
     * })
     * 
     */
    create<T extends FacultyCreateArgs>(args: SelectSubset<T, FacultyCreateArgs<ExtArgs>>): Prisma__FacultyClient<$Result.GetResult<Prisma.$FacultyPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Faculties.
     * @param {FacultyCreateManyArgs} args - Arguments to create many Faculties.
     * @example
     * // Create many Faculties
     * const faculty = await prisma.faculty.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends FacultyCreateManyArgs>(args?: SelectSubset<T, FacultyCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Faculties and returns the data saved in the database.
     * @param {FacultyCreateManyAndReturnArgs} args - Arguments to create many Faculties.
     * @example
     * // Create many Faculties
     * const faculty = await prisma.faculty.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Faculties and only return the `id`
     * const facultyWithIdOnly = await prisma.faculty.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends FacultyCreateManyAndReturnArgs>(args?: SelectSubset<T, FacultyCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$FacultyPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Faculty.
     * @param {FacultyDeleteArgs} args - Arguments to delete one Faculty.
     * @example
     * // Delete one Faculty
     * const Faculty = await prisma.faculty.delete({
     *   where: {
     *     // ... filter to delete one Faculty
     *   }
     * })
     * 
     */
    delete<T extends FacultyDeleteArgs>(args: SelectSubset<T, FacultyDeleteArgs<ExtArgs>>): Prisma__FacultyClient<$Result.GetResult<Prisma.$FacultyPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Faculty.
     * @param {FacultyUpdateArgs} args - Arguments to update one Faculty.
     * @example
     * // Update one Faculty
     * const faculty = await prisma.faculty.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends FacultyUpdateArgs>(args: SelectSubset<T, FacultyUpdateArgs<ExtArgs>>): Prisma__FacultyClient<$Result.GetResult<Prisma.$FacultyPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Faculties.
     * @param {FacultyDeleteManyArgs} args - Arguments to filter Faculties to delete.
     * @example
     * // Delete a few Faculties
     * const { count } = await prisma.faculty.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends FacultyDeleteManyArgs>(args?: SelectSubset<T, FacultyDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Faculties.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FacultyUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Faculties
     * const faculty = await prisma.faculty.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends FacultyUpdateManyArgs>(args: SelectSubset<T, FacultyUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Faculties and returns the data updated in the database.
     * @param {FacultyUpdateManyAndReturnArgs} args - Arguments to update many Faculties.
     * @example
     * // Update many Faculties
     * const faculty = await prisma.faculty.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Faculties and only return the `id`
     * const facultyWithIdOnly = await prisma.faculty.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends FacultyUpdateManyAndReturnArgs>(args: SelectSubset<T, FacultyUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$FacultyPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Faculty.
     * @param {FacultyUpsertArgs} args - Arguments to update or create a Faculty.
     * @example
     * // Update or create a Faculty
     * const faculty = await prisma.faculty.upsert({
     *   create: {
     *     // ... data to create a Faculty
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Faculty we want to update
     *   }
     * })
     */
    upsert<T extends FacultyUpsertArgs>(args: SelectSubset<T, FacultyUpsertArgs<ExtArgs>>): Prisma__FacultyClient<$Result.GetResult<Prisma.$FacultyPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Faculties.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FacultyCountArgs} args - Arguments to filter Faculties to count.
     * @example
     * // Count the number of Faculties
     * const count = await prisma.faculty.count({
     *   where: {
     *     // ... the filter for the Faculties we want to count
     *   }
     * })
    **/
    count<T extends FacultyCountArgs>(
      args?: Subset<T, FacultyCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], FacultyCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Faculty.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FacultyAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends FacultyAggregateArgs>(args: Subset<T, FacultyAggregateArgs>): Prisma.PrismaPromise<GetFacultyAggregateType<T>>

    /**
     * Group by Faculty.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FacultyGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends FacultyGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: FacultyGroupByArgs['orderBy'] }
        : { orderBy?: FacultyGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, FacultyGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetFacultyGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Faculty model
   */
  readonly fields: FacultyFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Faculty.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__FacultyClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    courses<T extends Faculty$coursesArgs<ExtArgs> = {}>(args?: Subset<T, Faculty$coursesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CoursePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    departments<T extends Faculty$departmentsArgs<ExtArgs> = {}>(args?: Subset<T, Faculty$departmentsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DepartmentPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Faculty model
   */
  interface FacultyFieldRefs {
    readonly id: FieldRef<"Faculty", 'String'>
    readonly nameNo: FieldRef<"Faculty", 'String'>
    readonly nameEn: FieldRef<"Faculty", 'String'>
    readonly code: FieldRef<"Faculty", 'Int'>
  }
    

  // Custom InputTypes
  /**
   * Faculty findUnique
   */
  export type FacultyFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Faculty
     */
    select?: FacultySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Faculty
     */
    omit?: FacultyOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FacultyInclude<ExtArgs> | null
    /**
     * Filter, which Faculty to fetch.
     */
    where: FacultyWhereUniqueInput
    relationLoadStrategy?: RelationLoadStrategy
  }

  /**
   * Faculty findUniqueOrThrow
   */
  export type FacultyFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Faculty
     */
    select?: FacultySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Faculty
     */
    omit?: FacultyOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FacultyInclude<ExtArgs> | null
    /**
     * Filter, which Faculty to fetch.
     */
    where: FacultyWhereUniqueInput
    relationLoadStrategy?: RelationLoadStrategy
  }

  /**
   * Faculty findFirst
   */
  export type FacultyFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Faculty
     */
    select?: FacultySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Faculty
     */
    omit?: FacultyOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FacultyInclude<ExtArgs> | null
    /**
     * Filter, which Faculty to fetch.
     */
    where?: FacultyWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Faculties to fetch.
     */
    orderBy?: FacultyOrderByWithRelationInput | FacultyOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Faculties.
     */
    cursor?: FacultyWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Faculties from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Faculties.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Faculties.
     */
    distinct?: FacultyScalarFieldEnum | FacultyScalarFieldEnum[]
    relationLoadStrategy?: RelationLoadStrategy
  }

  /**
   * Faculty findFirstOrThrow
   */
  export type FacultyFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Faculty
     */
    select?: FacultySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Faculty
     */
    omit?: FacultyOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FacultyInclude<ExtArgs> | null
    /**
     * Filter, which Faculty to fetch.
     */
    where?: FacultyWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Faculties to fetch.
     */
    orderBy?: FacultyOrderByWithRelationInput | FacultyOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Faculties.
     */
    cursor?: FacultyWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Faculties from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Faculties.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Faculties.
     */
    distinct?: FacultyScalarFieldEnum | FacultyScalarFieldEnum[]
    relationLoadStrategy?: RelationLoadStrategy
  }

  /**
   * Faculty findMany
   */
  export type FacultyFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Faculty
     */
    select?: FacultySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Faculty
     */
    omit?: FacultyOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FacultyInclude<ExtArgs> | null
    /**
     * Filter, which Faculties to fetch.
     */
    where?: FacultyWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Faculties to fetch.
     */
    orderBy?: FacultyOrderByWithRelationInput | FacultyOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Faculties.
     */
    cursor?: FacultyWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Faculties from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Faculties.
     */
    skip?: number
    distinct?: FacultyScalarFieldEnum | FacultyScalarFieldEnum[]
    relationLoadStrategy?: RelationLoadStrategy
  }

  /**
   * Faculty create
   */
  export type FacultyCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Faculty
     */
    select?: FacultySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Faculty
     */
    omit?: FacultyOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FacultyInclude<ExtArgs> | null
    /**
     * The data needed to create a Faculty.
     */
    data: XOR<FacultyCreateInput, FacultyUncheckedCreateInput>
    relationLoadStrategy?: RelationLoadStrategy
  }

  /**
   * Faculty createMany
   */
  export type FacultyCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Faculties.
     */
    data: FacultyCreateManyInput | FacultyCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Faculty createManyAndReturn
   */
  export type FacultyCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Faculty
     */
    select?: FacultySelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Faculty
     */
    omit?: FacultyOmit<ExtArgs> | null
    /**
     * The data used to create many Faculties.
     */
    data: FacultyCreateManyInput | FacultyCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Faculty update
   */
  export type FacultyUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Faculty
     */
    select?: FacultySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Faculty
     */
    omit?: FacultyOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FacultyInclude<ExtArgs> | null
    /**
     * The data needed to update a Faculty.
     */
    data: XOR<FacultyUpdateInput, FacultyUncheckedUpdateInput>
    /**
     * Choose, which Faculty to update.
     */
    where: FacultyWhereUniqueInput
    relationLoadStrategy?: RelationLoadStrategy
  }

  /**
   * Faculty updateMany
   */
  export type FacultyUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Faculties.
     */
    data: XOR<FacultyUpdateManyMutationInput, FacultyUncheckedUpdateManyInput>
    /**
     * Filter which Faculties to update
     */
    where?: FacultyWhereInput
    /**
     * Limit how many Faculties to update.
     */
    limit?: number
  }

  /**
   * Faculty updateManyAndReturn
   */
  export type FacultyUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Faculty
     */
    select?: FacultySelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Faculty
     */
    omit?: FacultyOmit<ExtArgs> | null
    /**
     * The data used to update Faculties.
     */
    data: XOR<FacultyUpdateManyMutationInput, FacultyUncheckedUpdateManyInput>
    /**
     * Filter which Faculties to update
     */
    where?: FacultyWhereInput
    /**
     * Limit how many Faculties to update.
     */
    limit?: number
  }

  /**
   * Faculty upsert
   */
  export type FacultyUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Faculty
     */
    select?: FacultySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Faculty
     */
    omit?: FacultyOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FacultyInclude<ExtArgs> | null
    /**
     * The filter to search for the Faculty to update in case it exists.
     */
    where: FacultyWhereUniqueInput
    /**
     * In case the Faculty found by the `where` argument doesn't exist, create a new Faculty with this data.
     */
    create: XOR<FacultyCreateInput, FacultyUncheckedCreateInput>
    /**
     * In case the Faculty was found with the provided `where` argument, update it with this data.
     */
    update: XOR<FacultyUpdateInput, FacultyUncheckedUpdateInput>
    relationLoadStrategy?: RelationLoadStrategy
  }

  /**
   * Faculty delete
   */
  export type FacultyDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Faculty
     */
    select?: FacultySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Faculty
     */
    omit?: FacultyOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FacultyInclude<ExtArgs> | null
    /**
     * Filter which Faculty to delete.
     */
    where: FacultyWhereUniqueInput
    relationLoadStrategy?: RelationLoadStrategy
  }

  /**
   * Faculty deleteMany
   */
  export type FacultyDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Faculties to delete
     */
    where?: FacultyWhereInput
    /**
     * Limit how many Faculties to delete.
     */
    limit?: number
  }

  /**
   * Faculty.courses
   */
  export type Faculty$coursesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Course
     */
    select?: CourseSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Course
     */
    omit?: CourseOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CourseInclude<ExtArgs> | null
    where?: CourseWhereInput
    orderBy?: CourseOrderByWithRelationInput | CourseOrderByWithRelationInput[]
    cursor?: CourseWhereUniqueInput
    take?: number
    skip?: number
    distinct?: CourseScalarFieldEnum | CourseScalarFieldEnum[]
  }

  /**
   * Faculty.departments
   */
  export type Faculty$departmentsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Department
     */
    select?: DepartmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Department
     */
    omit?: DepartmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DepartmentInclude<ExtArgs> | null
    where?: DepartmentWhereInput
    orderBy?: DepartmentOrderByWithRelationInput | DepartmentOrderByWithRelationInput[]
    cursor?: DepartmentWhereUniqueInput
    take?: number
    skip?: number
    distinct?: DepartmentScalarFieldEnum | DepartmentScalarFieldEnum[]
  }

  /**
   * Faculty without action
   */
  export type FacultyDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Faculty
     */
    select?: FacultySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Faculty
     */
    omit?: FacultyOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FacultyInclude<ExtArgs> | null
  }


  /**
   * Model Department
   */

  export type AggregateDepartment = {
    _count: DepartmentCountAggregateOutputType | null
    _avg: DepartmentAvgAggregateOutputType | null
    _sum: DepartmentSumAggregateOutputType | null
    _min: DepartmentMinAggregateOutputType | null
    _max: DepartmentMaxAggregateOutputType | null
  }

  export type DepartmentAvgAggregateOutputType = {
    code: number | null
  }

  export type DepartmentSumAggregateOutputType = {
    code: number | null
  }

  export type DepartmentMinAggregateOutputType = {
    id: string | null
    nameNo: string | null
    nameEn: string | null
    code: number | null
    facultyId: string | null
  }

  export type DepartmentMaxAggregateOutputType = {
    id: string | null
    nameNo: string | null
    nameEn: string | null
    code: number | null
    facultyId: string | null
  }

  export type DepartmentCountAggregateOutputType = {
    id: number
    nameNo: number
    nameEn: number
    code: number
    facultyId: number
    _all: number
  }


  export type DepartmentAvgAggregateInputType = {
    code?: true
  }

  export type DepartmentSumAggregateInputType = {
    code?: true
  }

  export type DepartmentMinAggregateInputType = {
    id?: true
    nameNo?: true
    nameEn?: true
    code?: true
    facultyId?: true
  }

  export type DepartmentMaxAggregateInputType = {
    id?: true
    nameNo?: true
    nameEn?: true
    code?: true
    facultyId?: true
  }

  export type DepartmentCountAggregateInputType = {
    id?: true
    nameNo?: true
    nameEn?: true
    code?: true
    facultyId?: true
    _all?: true
  }

  export type DepartmentAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Department to aggregate.
     */
    where?: DepartmentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Departments to fetch.
     */
    orderBy?: DepartmentOrderByWithRelationInput | DepartmentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: DepartmentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Departments from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Departments.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Departments
    **/
    _count?: true | DepartmentCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: DepartmentAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: DepartmentSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: DepartmentMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: DepartmentMaxAggregateInputType
  }

  export type GetDepartmentAggregateType<T extends DepartmentAggregateArgs> = {
        [P in keyof T & keyof AggregateDepartment]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateDepartment[P]>
      : GetScalarType<T[P], AggregateDepartment[P]>
  }




  export type DepartmentGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: DepartmentWhereInput
    orderBy?: DepartmentOrderByWithAggregationInput | DepartmentOrderByWithAggregationInput[]
    by: DepartmentScalarFieldEnum[] | DepartmentScalarFieldEnum
    having?: DepartmentScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: DepartmentCountAggregateInputType | true
    _avg?: DepartmentAvgAggregateInputType
    _sum?: DepartmentSumAggregateInputType
    _min?: DepartmentMinAggregateInputType
    _max?: DepartmentMaxAggregateInputType
  }

  export type DepartmentGroupByOutputType = {
    id: string
    nameNo: string
    nameEn: string
    code: number
    facultyId: string
    _count: DepartmentCountAggregateOutputType | null
    _avg: DepartmentAvgAggregateOutputType | null
    _sum: DepartmentSumAggregateOutputType | null
    _min: DepartmentMinAggregateOutputType | null
    _max: DepartmentMaxAggregateOutputType | null
  }

  type GetDepartmentGroupByPayload<T extends DepartmentGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<DepartmentGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof DepartmentGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], DepartmentGroupByOutputType[P]>
            : GetScalarType<T[P], DepartmentGroupByOutputType[P]>
        }
      >
    >


  export type DepartmentSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    nameNo?: boolean
    nameEn?: boolean
    code?: boolean
    facultyId?: boolean
    courses?: boolean | Department$coursesArgs<ExtArgs>
    faculty?: boolean | FacultyDefaultArgs<ExtArgs>
    _count?: boolean | DepartmentCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["department"]>

  export type DepartmentSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    nameNo?: boolean
    nameEn?: boolean
    code?: boolean
    facultyId?: boolean
    faculty?: boolean | FacultyDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["department"]>

  export type DepartmentSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    nameNo?: boolean
    nameEn?: boolean
    code?: boolean
    facultyId?: boolean
    faculty?: boolean | FacultyDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["department"]>

  export type DepartmentSelectScalar = {
    id?: boolean
    nameNo?: boolean
    nameEn?: boolean
    code?: boolean
    facultyId?: boolean
  }

  export type DepartmentOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "nameNo" | "nameEn" | "code" | "facultyId", ExtArgs["result"]["department"]>
  export type DepartmentInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    courses?: boolean | Department$coursesArgs<ExtArgs>
    faculty?: boolean | FacultyDefaultArgs<ExtArgs>
    _count?: boolean | DepartmentCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type DepartmentIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    faculty?: boolean | FacultyDefaultArgs<ExtArgs>
  }
  export type DepartmentIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    faculty?: boolean | FacultyDefaultArgs<ExtArgs>
  }

  export type $DepartmentPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Department"
    objects: {
      courses: Prisma.$CoursePayload<ExtArgs>[]
      faculty: Prisma.$FacultyPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      nameNo: string
      nameEn: string
      /**
       * DBH code for department, for example "230240"
       */
      code: number
      facultyId: string
    }, ExtArgs["result"]["department"]>
    composites: {}
  }

  type DepartmentGetPayload<S extends boolean | null | undefined | DepartmentDefaultArgs> = $Result.GetResult<Prisma.$DepartmentPayload, S>

  type DepartmentCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<DepartmentFindManyArgs, 'select' | 'include' | 'distinct' | 'omit' | 'relationLoadStrategy'> & {
      select?: DepartmentCountAggregateInputType | true
    }

  export interface DepartmentDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Department'], meta: { name: 'Department' } }
    /**
     * Find zero or one Department that matches the filter.
     * @param {DepartmentFindUniqueArgs} args - Arguments to find a Department
     * @example
     * // Get one Department
     * const department = await prisma.department.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends DepartmentFindUniqueArgs>(args: SelectSubset<T, DepartmentFindUniqueArgs<ExtArgs>>): Prisma__DepartmentClient<$Result.GetResult<Prisma.$DepartmentPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Department that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {DepartmentFindUniqueOrThrowArgs} args - Arguments to find a Department
     * @example
     * // Get one Department
     * const department = await prisma.department.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends DepartmentFindUniqueOrThrowArgs>(args: SelectSubset<T, DepartmentFindUniqueOrThrowArgs<ExtArgs>>): Prisma__DepartmentClient<$Result.GetResult<Prisma.$DepartmentPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Department that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DepartmentFindFirstArgs} args - Arguments to find a Department
     * @example
     * // Get one Department
     * const department = await prisma.department.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends DepartmentFindFirstArgs>(args?: SelectSubset<T, DepartmentFindFirstArgs<ExtArgs>>): Prisma__DepartmentClient<$Result.GetResult<Prisma.$DepartmentPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Department that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DepartmentFindFirstOrThrowArgs} args - Arguments to find a Department
     * @example
     * // Get one Department
     * const department = await prisma.department.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends DepartmentFindFirstOrThrowArgs>(args?: SelectSubset<T, DepartmentFindFirstOrThrowArgs<ExtArgs>>): Prisma__DepartmentClient<$Result.GetResult<Prisma.$DepartmentPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Departments that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DepartmentFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Departments
     * const departments = await prisma.department.findMany()
     * 
     * // Get first 10 Departments
     * const departments = await prisma.department.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const departmentWithIdOnly = await prisma.department.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends DepartmentFindManyArgs>(args?: SelectSubset<T, DepartmentFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DepartmentPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Department.
     * @param {DepartmentCreateArgs} args - Arguments to create a Department.
     * @example
     * // Create one Department
     * const Department = await prisma.department.create({
     *   data: {
     *     // ... data to create a Department
     *   }
     * })
     * 
     */
    create<T extends DepartmentCreateArgs>(args: SelectSubset<T, DepartmentCreateArgs<ExtArgs>>): Prisma__DepartmentClient<$Result.GetResult<Prisma.$DepartmentPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Departments.
     * @param {DepartmentCreateManyArgs} args - Arguments to create many Departments.
     * @example
     * // Create many Departments
     * const department = await prisma.department.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends DepartmentCreateManyArgs>(args?: SelectSubset<T, DepartmentCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Departments and returns the data saved in the database.
     * @param {DepartmentCreateManyAndReturnArgs} args - Arguments to create many Departments.
     * @example
     * // Create many Departments
     * const department = await prisma.department.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Departments and only return the `id`
     * const departmentWithIdOnly = await prisma.department.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends DepartmentCreateManyAndReturnArgs>(args?: SelectSubset<T, DepartmentCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DepartmentPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Department.
     * @param {DepartmentDeleteArgs} args - Arguments to delete one Department.
     * @example
     * // Delete one Department
     * const Department = await prisma.department.delete({
     *   where: {
     *     // ... filter to delete one Department
     *   }
     * })
     * 
     */
    delete<T extends DepartmentDeleteArgs>(args: SelectSubset<T, DepartmentDeleteArgs<ExtArgs>>): Prisma__DepartmentClient<$Result.GetResult<Prisma.$DepartmentPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Department.
     * @param {DepartmentUpdateArgs} args - Arguments to update one Department.
     * @example
     * // Update one Department
     * const department = await prisma.department.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends DepartmentUpdateArgs>(args: SelectSubset<T, DepartmentUpdateArgs<ExtArgs>>): Prisma__DepartmentClient<$Result.GetResult<Prisma.$DepartmentPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Departments.
     * @param {DepartmentDeleteManyArgs} args - Arguments to filter Departments to delete.
     * @example
     * // Delete a few Departments
     * const { count } = await prisma.department.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends DepartmentDeleteManyArgs>(args?: SelectSubset<T, DepartmentDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Departments.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DepartmentUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Departments
     * const department = await prisma.department.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends DepartmentUpdateManyArgs>(args: SelectSubset<T, DepartmentUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Departments and returns the data updated in the database.
     * @param {DepartmentUpdateManyAndReturnArgs} args - Arguments to update many Departments.
     * @example
     * // Update many Departments
     * const department = await prisma.department.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Departments and only return the `id`
     * const departmentWithIdOnly = await prisma.department.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends DepartmentUpdateManyAndReturnArgs>(args: SelectSubset<T, DepartmentUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DepartmentPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Department.
     * @param {DepartmentUpsertArgs} args - Arguments to update or create a Department.
     * @example
     * // Update or create a Department
     * const department = await prisma.department.upsert({
     *   create: {
     *     // ... data to create a Department
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Department we want to update
     *   }
     * })
     */
    upsert<T extends DepartmentUpsertArgs>(args: SelectSubset<T, DepartmentUpsertArgs<ExtArgs>>): Prisma__DepartmentClient<$Result.GetResult<Prisma.$DepartmentPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Departments.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DepartmentCountArgs} args - Arguments to filter Departments to count.
     * @example
     * // Count the number of Departments
     * const count = await prisma.department.count({
     *   where: {
     *     // ... the filter for the Departments we want to count
     *   }
     * })
    **/
    count<T extends DepartmentCountArgs>(
      args?: Subset<T, DepartmentCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], DepartmentCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Department.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DepartmentAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends DepartmentAggregateArgs>(args: Subset<T, DepartmentAggregateArgs>): Prisma.PrismaPromise<GetDepartmentAggregateType<T>>

    /**
     * Group by Department.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DepartmentGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends DepartmentGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: DepartmentGroupByArgs['orderBy'] }
        : { orderBy?: DepartmentGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, DepartmentGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetDepartmentGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Department model
   */
  readonly fields: DepartmentFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Department.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__DepartmentClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    courses<T extends Department$coursesArgs<ExtArgs> = {}>(args?: Subset<T, Department$coursesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CoursePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    faculty<T extends FacultyDefaultArgs<ExtArgs> = {}>(args?: Subset<T, FacultyDefaultArgs<ExtArgs>>): Prisma__FacultyClient<$Result.GetResult<Prisma.$FacultyPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Department model
   */
  interface DepartmentFieldRefs {
    readonly id: FieldRef<"Department", 'String'>
    readonly nameNo: FieldRef<"Department", 'String'>
    readonly nameEn: FieldRef<"Department", 'String'>
    readonly code: FieldRef<"Department", 'Int'>
    readonly facultyId: FieldRef<"Department", 'String'>
  }
    

  // Custom InputTypes
  /**
   * Department findUnique
   */
  export type DepartmentFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Department
     */
    select?: DepartmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Department
     */
    omit?: DepartmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DepartmentInclude<ExtArgs> | null
    /**
     * Filter, which Department to fetch.
     */
    where: DepartmentWhereUniqueInput
    relationLoadStrategy?: RelationLoadStrategy
  }

  /**
   * Department findUniqueOrThrow
   */
  export type DepartmentFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Department
     */
    select?: DepartmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Department
     */
    omit?: DepartmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DepartmentInclude<ExtArgs> | null
    /**
     * Filter, which Department to fetch.
     */
    where: DepartmentWhereUniqueInput
    relationLoadStrategy?: RelationLoadStrategy
  }

  /**
   * Department findFirst
   */
  export type DepartmentFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Department
     */
    select?: DepartmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Department
     */
    omit?: DepartmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DepartmentInclude<ExtArgs> | null
    /**
     * Filter, which Department to fetch.
     */
    where?: DepartmentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Departments to fetch.
     */
    orderBy?: DepartmentOrderByWithRelationInput | DepartmentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Departments.
     */
    cursor?: DepartmentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Departments from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Departments.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Departments.
     */
    distinct?: DepartmentScalarFieldEnum | DepartmentScalarFieldEnum[]
    relationLoadStrategy?: RelationLoadStrategy
  }

  /**
   * Department findFirstOrThrow
   */
  export type DepartmentFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Department
     */
    select?: DepartmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Department
     */
    omit?: DepartmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DepartmentInclude<ExtArgs> | null
    /**
     * Filter, which Department to fetch.
     */
    where?: DepartmentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Departments to fetch.
     */
    orderBy?: DepartmentOrderByWithRelationInput | DepartmentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Departments.
     */
    cursor?: DepartmentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Departments from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Departments.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Departments.
     */
    distinct?: DepartmentScalarFieldEnum | DepartmentScalarFieldEnum[]
    relationLoadStrategy?: RelationLoadStrategy
  }

  /**
   * Department findMany
   */
  export type DepartmentFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Department
     */
    select?: DepartmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Department
     */
    omit?: DepartmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DepartmentInclude<ExtArgs> | null
    /**
     * Filter, which Departments to fetch.
     */
    where?: DepartmentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Departments to fetch.
     */
    orderBy?: DepartmentOrderByWithRelationInput | DepartmentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Departments.
     */
    cursor?: DepartmentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Departments from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Departments.
     */
    skip?: number
    distinct?: DepartmentScalarFieldEnum | DepartmentScalarFieldEnum[]
    relationLoadStrategy?: RelationLoadStrategy
  }

  /**
   * Department create
   */
  export type DepartmentCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Department
     */
    select?: DepartmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Department
     */
    omit?: DepartmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DepartmentInclude<ExtArgs> | null
    /**
     * The data needed to create a Department.
     */
    data: XOR<DepartmentCreateInput, DepartmentUncheckedCreateInput>
    relationLoadStrategy?: RelationLoadStrategy
  }

  /**
   * Department createMany
   */
  export type DepartmentCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Departments.
     */
    data: DepartmentCreateManyInput | DepartmentCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Department createManyAndReturn
   */
  export type DepartmentCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Department
     */
    select?: DepartmentSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Department
     */
    omit?: DepartmentOmit<ExtArgs> | null
    /**
     * The data used to create many Departments.
     */
    data: DepartmentCreateManyInput | DepartmentCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DepartmentIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Department update
   */
  export type DepartmentUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Department
     */
    select?: DepartmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Department
     */
    omit?: DepartmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DepartmentInclude<ExtArgs> | null
    /**
     * The data needed to update a Department.
     */
    data: XOR<DepartmentUpdateInput, DepartmentUncheckedUpdateInput>
    /**
     * Choose, which Department to update.
     */
    where: DepartmentWhereUniqueInput
    relationLoadStrategy?: RelationLoadStrategy
  }

  /**
   * Department updateMany
   */
  export type DepartmentUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Departments.
     */
    data: XOR<DepartmentUpdateManyMutationInput, DepartmentUncheckedUpdateManyInput>
    /**
     * Filter which Departments to update
     */
    where?: DepartmentWhereInput
    /**
     * Limit how many Departments to update.
     */
    limit?: number
  }

  /**
   * Department updateManyAndReturn
   */
  export type DepartmentUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Department
     */
    select?: DepartmentSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Department
     */
    omit?: DepartmentOmit<ExtArgs> | null
    /**
     * The data used to update Departments.
     */
    data: XOR<DepartmentUpdateManyMutationInput, DepartmentUncheckedUpdateManyInput>
    /**
     * Filter which Departments to update
     */
    where?: DepartmentWhereInput
    /**
     * Limit how many Departments to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DepartmentIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Department upsert
   */
  export type DepartmentUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Department
     */
    select?: DepartmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Department
     */
    omit?: DepartmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DepartmentInclude<ExtArgs> | null
    /**
     * The filter to search for the Department to update in case it exists.
     */
    where: DepartmentWhereUniqueInput
    /**
     * In case the Department found by the `where` argument doesn't exist, create a new Department with this data.
     */
    create: XOR<DepartmentCreateInput, DepartmentUncheckedCreateInput>
    /**
     * In case the Department was found with the provided `where` argument, update it with this data.
     */
    update: XOR<DepartmentUpdateInput, DepartmentUncheckedUpdateInput>
    relationLoadStrategy?: RelationLoadStrategy
  }

  /**
   * Department delete
   */
  export type DepartmentDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Department
     */
    select?: DepartmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Department
     */
    omit?: DepartmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DepartmentInclude<ExtArgs> | null
    /**
     * Filter which Department to delete.
     */
    where: DepartmentWhereUniqueInput
    relationLoadStrategy?: RelationLoadStrategy
  }

  /**
   * Department deleteMany
   */
  export type DepartmentDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Departments to delete
     */
    where?: DepartmentWhereInput
    /**
     * Limit how many Departments to delete.
     */
    limit?: number
  }

  /**
   * Department.courses
   */
  export type Department$coursesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Course
     */
    select?: CourseSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Course
     */
    omit?: CourseOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CourseInclude<ExtArgs> | null
    where?: CourseWhereInput
    orderBy?: CourseOrderByWithRelationInput | CourseOrderByWithRelationInput[]
    cursor?: CourseWhereUniqueInput
    take?: number
    skip?: number
    distinct?: CourseScalarFieldEnum | CourseScalarFieldEnum[]
  }

  /**
   * Department without action
   */
  export type DepartmentDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Department
     */
    select?: DepartmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Department
     */
    omit?: DepartmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DepartmentInclude<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const CourseScalarFieldEnum: {
    id: 'id',
    code: 'code',
    nameNo: 'nameNo',
    nameEn: 'nameEn',
    credits: 'credits',
    studyLevel: 'studyLevel',
    gradeType: 'gradeType',
    firstYearTaught: 'firstYearTaught',
    lastYearTaught: 'lastYearTaught',
    contentNo: 'contentNo',
    contentEn: 'contentEn',
    teachingMethodsNo: 'teachingMethodsNo',
    teachingMethodsEn: 'teachingMethodsEn',
    learningOutcomesNo: 'learningOutcomesNo',
    learningOutcomesEn: 'learningOutcomesEn',
    examTypeNo: 'examTypeNo',
    examTypeEn: 'examTypeEn',
    candidateCount: 'candidateCount',
    averageGrade: 'averageGrade',
    passRate: 'passRate',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    taughtSemesters: 'taughtSemesters',
    teachingLanguages: 'teachingLanguages',
    campuses: 'campuses',
    facultyId: 'facultyId',
    departmentId: 'departmentId',
    latestYearCheckedForNtnuData: 'latestYearCheckedForNtnuData'
  };

  export type CourseScalarFieldEnum = (typeof CourseScalarFieldEnum)[keyof typeof CourseScalarFieldEnum]


  export const RelationLoadStrategy: {
    query: 'query',
    join: 'join'
  };

  export type RelationLoadStrategy = (typeof RelationLoadStrategy)[keyof typeof RelationLoadStrategy]


  export const GradeScalarFieldEnum: {
    id: 'id',
    gradeACount: 'gradeACount',
    gradeBCount: 'gradeBCount',
    gradeCCount: 'gradeCCount',
    gradeDCount: 'gradeDCount',
    gradeECount: 'gradeECount',
    gradeFCount: 'gradeFCount',
    passedCount: 'passedCount',
    failedCount: 'failedCount',
    courseId: 'courseId',
    semester: 'semester',
    year: 'year',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type GradeScalarFieldEnum = (typeof GradeScalarFieldEnum)[keyof typeof GradeScalarFieldEnum]


  export const FacultyScalarFieldEnum: {
    id: 'id',
    nameNo: 'nameNo',
    nameEn: 'nameEn',
    code: 'code'
  };

  export type FacultyScalarFieldEnum = (typeof FacultyScalarFieldEnum)[keyof typeof FacultyScalarFieldEnum]


  export const DepartmentScalarFieldEnum: {
    id: 'id',
    nameNo: 'nameNo',
    nameEn: 'nameEn',
    code: 'code',
    facultyId: 'facultyId'
  };

  export type DepartmentScalarFieldEnum = (typeof DepartmentScalarFieldEnum)[keyof typeof DepartmentScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  /**
   * Field references
   */


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'String[]'
   */
  export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    


  /**
   * Reference to a field of type 'Float[]'
   */
  export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float[]'>
    


  /**
   * Reference to a field of type 'StudyLevel'
   */
  export type EnumStudyLevelFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'StudyLevel'>
    


  /**
   * Reference to a field of type 'StudyLevel[]'
   */
  export type ListEnumStudyLevelFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'StudyLevel[]'>
    


  /**
   * Reference to a field of type 'GradeType'
   */
  export type EnumGradeTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'GradeType'>
    


  /**
   * Reference to a field of type 'GradeType[]'
   */
  export type ListEnumGradeTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'GradeType[]'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


  /**
   * Reference to a field of type 'Semester[]'
   */
  export type ListEnumSemesterFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Semester[]'>
    


  /**
   * Reference to a field of type 'Semester'
   */
  export type EnumSemesterFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Semester'>
    


  /**
   * Reference to a field of type 'TeachingLanguage[]'
   */
  export type ListEnumTeachingLanguageFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'TeachingLanguage[]'>
    


  /**
   * Reference to a field of type 'TeachingLanguage'
   */
  export type EnumTeachingLanguageFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'TeachingLanguage'>
    


  /**
   * Reference to a field of type 'Campus[]'
   */
  export type ListEnumCampusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Campus[]'>
    


  /**
   * Reference to a field of type 'Campus'
   */
  export type EnumCampusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Campus'>
    
  /**
   * Deep Input Types
   */


  export type CourseWhereInput = {
    AND?: CourseWhereInput | CourseWhereInput[]
    OR?: CourseWhereInput[]
    NOT?: CourseWhereInput | CourseWhereInput[]
    id?: StringFilter<"Course"> | string
    code?: StringFilter<"Course"> | string
    nameNo?: StringFilter<"Course"> | string
    nameEn?: StringNullableFilter<"Course"> | string | null
    credits?: FloatNullableFilter<"Course"> | number | null
    studyLevel?: EnumStudyLevelFilter<"Course"> | $Enums.StudyLevel
    gradeType?: EnumGradeTypeFilter<"Course"> | $Enums.GradeType
    firstYearTaught?: IntFilter<"Course"> | number
    lastYearTaught?: IntNullableFilter<"Course"> | number | null
    contentNo?: StringNullableFilter<"Course"> | string | null
    contentEn?: StringNullableFilter<"Course"> | string | null
    teachingMethodsNo?: StringNullableFilter<"Course"> | string | null
    teachingMethodsEn?: StringNullableFilter<"Course"> | string | null
    learningOutcomesNo?: StringNullableFilter<"Course"> | string | null
    learningOutcomesEn?: StringNullableFilter<"Course"> | string | null
    examTypeNo?: StringNullableFilter<"Course"> | string | null
    examTypeEn?: StringNullableFilter<"Course"> | string | null
    candidateCount?: IntFilter<"Course"> | number
    averageGrade?: FloatFilter<"Course"> | number
    passRate?: FloatFilter<"Course"> | number
    createdAt?: DateTimeFilter<"Course"> | Date | string
    updatedAt?: DateTimeFilter<"Course"> | Date | string
    taughtSemesters?: EnumSemesterNullableListFilter<"Course">
    teachingLanguages?: EnumTeachingLanguageNullableListFilter<"Course">
    campuses?: EnumCampusNullableListFilter<"Course">
    facultyId?: StringNullableFilter<"Course"> | string | null
    departmentId?: StringNullableFilter<"Course"> | string | null
    latestYearCheckedForNtnuData?: IntNullableFilter<"Course"> | number | null
    grades?: GradeListRelationFilter
    faculty?: XOR<FacultyNullableScalarRelationFilter, FacultyWhereInput> | null
    department?: XOR<DepartmentNullableScalarRelationFilter, DepartmentWhereInput> | null
  }

  export type CourseOrderByWithRelationInput = {
    id?: SortOrder
    code?: SortOrder
    nameNo?: SortOrder
    nameEn?: SortOrderInput | SortOrder
    credits?: SortOrderInput | SortOrder
    studyLevel?: SortOrder
    gradeType?: SortOrder
    firstYearTaught?: SortOrder
    lastYearTaught?: SortOrderInput | SortOrder
    contentNo?: SortOrderInput | SortOrder
    contentEn?: SortOrderInput | SortOrder
    teachingMethodsNo?: SortOrderInput | SortOrder
    teachingMethodsEn?: SortOrderInput | SortOrder
    learningOutcomesNo?: SortOrderInput | SortOrder
    learningOutcomesEn?: SortOrderInput | SortOrder
    examTypeNo?: SortOrderInput | SortOrder
    examTypeEn?: SortOrderInput | SortOrder
    candidateCount?: SortOrder
    averageGrade?: SortOrder
    passRate?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    taughtSemesters?: SortOrder
    teachingLanguages?: SortOrder
    campuses?: SortOrder
    facultyId?: SortOrderInput | SortOrder
    departmentId?: SortOrderInput | SortOrder
    latestYearCheckedForNtnuData?: SortOrderInput | SortOrder
    grades?: GradeOrderByRelationAggregateInput
    faculty?: FacultyOrderByWithRelationInput
    department?: DepartmentOrderByWithRelationInput
  }

  export type CourseWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    code?: string
    AND?: CourseWhereInput | CourseWhereInput[]
    OR?: CourseWhereInput[]
    NOT?: CourseWhereInput | CourseWhereInput[]
    nameNo?: StringFilter<"Course"> | string
    nameEn?: StringNullableFilter<"Course"> | string | null
    credits?: FloatNullableFilter<"Course"> | number | null
    studyLevel?: EnumStudyLevelFilter<"Course"> | $Enums.StudyLevel
    gradeType?: EnumGradeTypeFilter<"Course"> | $Enums.GradeType
    firstYearTaught?: IntFilter<"Course"> | number
    lastYearTaught?: IntNullableFilter<"Course"> | number | null
    contentNo?: StringNullableFilter<"Course"> | string | null
    contentEn?: StringNullableFilter<"Course"> | string | null
    teachingMethodsNo?: StringNullableFilter<"Course"> | string | null
    teachingMethodsEn?: StringNullableFilter<"Course"> | string | null
    learningOutcomesNo?: StringNullableFilter<"Course"> | string | null
    learningOutcomesEn?: StringNullableFilter<"Course"> | string | null
    examTypeNo?: StringNullableFilter<"Course"> | string | null
    examTypeEn?: StringNullableFilter<"Course"> | string | null
    candidateCount?: IntFilter<"Course"> | number
    averageGrade?: FloatFilter<"Course"> | number
    passRate?: FloatFilter<"Course"> | number
    createdAt?: DateTimeFilter<"Course"> | Date | string
    updatedAt?: DateTimeFilter<"Course"> | Date | string
    taughtSemesters?: EnumSemesterNullableListFilter<"Course">
    teachingLanguages?: EnumTeachingLanguageNullableListFilter<"Course">
    campuses?: EnumCampusNullableListFilter<"Course">
    facultyId?: StringNullableFilter<"Course"> | string | null
    departmentId?: StringNullableFilter<"Course"> | string | null
    latestYearCheckedForNtnuData?: IntNullableFilter<"Course"> | number | null
    grades?: GradeListRelationFilter
    faculty?: XOR<FacultyNullableScalarRelationFilter, FacultyWhereInput> | null
    department?: XOR<DepartmentNullableScalarRelationFilter, DepartmentWhereInput> | null
  }, "id" | "code">

  export type CourseOrderByWithAggregationInput = {
    id?: SortOrder
    code?: SortOrder
    nameNo?: SortOrder
    nameEn?: SortOrderInput | SortOrder
    credits?: SortOrderInput | SortOrder
    studyLevel?: SortOrder
    gradeType?: SortOrder
    firstYearTaught?: SortOrder
    lastYearTaught?: SortOrderInput | SortOrder
    contentNo?: SortOrderInput | SortOrder
    contentEn?: SortOrderInput | SortOrder
    teachingMethodsNo?: SortOrderInput | SortOrder
    teachingMethodsEn?: SortOrderInput | SortOrder
    learningOutcomesNo?: SortOrderInput | SortOrder
    learningOutcomesEn?: SortOrderInput | SortOrder
    examTypeNo?: SortOrderInput | SortOrder
    examTypeEn?: SortOrderInput | SortOrder
    candidateCount?: SortOrder
    averageGrade?: SortOrder
    passRate?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    taughtSemesters?: SortOrder
    teachingLanguages?: SortOrder
    campuses?: SortOrder
    facultyId?: SortOrderInput | SortOrder
    departmentId?: SortOrderInput | SortOrder
    latestYearCheckedForNtnuData?: SortOrderInput | SortOrder
    _count?: CourseCountOrderByAggregateInput
    _avg?: CourseAvgOrderByAggregateInput
    _max?: CourseMaxOrderByAggregateInput
    _min?: CourseMinOrderByAggregateInput
    _sum?: CourseSumOrderByAggregateInput
  }

  export type CourseScalarWhereWithAggregatesInput = {
    AND?: CourseScalarWhereWithAggregatesInput | CourseScalarWhereWithAggregatesInput[]
    OR?: CourseScalarWhereWithAggregatesInput[]
    NOT?: CourseScalarWhereWithAggregatesInput | CourseScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Course"> | string
    code?: StringWithAggregatesFilter<"Course"> | string
    nameNo?: StringWithAggregatesFilter<"Course"> | string
    nameEn?: StringNullableWithAggregatesFilter<"Course"> | string | null
    credits?: FloatNullableWithAggregatesFilter<"Course"> | number | null
    studyLevel?: EnumStudyLevelWithAggregatesFilter<"Course"> | $Enums.StudyLevel
    gradeType?: EnumGradeTypeWithAggregatesFilter<"Course"> | $Enums.GradeType
    firstYearTaught?: IntWithAggregatesFilter<"Course"> | number
    lastYearTaught?: IntNullableWithAggregatesFilter<"Course"> | number | null
    contentNo?: StringNullableWithAggregatesFilter<"Course"> | string | null
    contentEn?: StringNullableWithAggregatesFilter<"Course"> | string | null
    teachingMethodsNo?: StringNullableWithAggregatesFilter<"Course"> | string | null
    teachingMethodsEn?: StringNullableWithAggregatesFilter<"Course"> | string | null
    learningOutcomesNo?: StringNullableWithAggregatesFilter<"Course"> | string | null
    learningOutcomesEn?: StringNullableWithAggregatesFilter<"Course"> | string | null
    examTypeNo?: StringNullableWithAggregatesFilter<"Course"> | string | null
    examTypeEn?: StringNullableWithAggregatesFilter<"Course"> | string | null
    candidateCount?: IntWithAggregatesFilter<"Course"> | number
    averageGrade?: FloatWithAggregatesFilter<"Course"> | number
    passRate?: FloatWithAggregatesFilter<"Course"> | number
    createdAt?: DateTimeWithAggregatesFilter<"Course"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Course"> | Date | string
    taughtSemesters?: EnumSemesterNullableListFilter<"Course">
    teachingLanguages?: EnumTeachingLanguageNullableListFilter<"Course">
    campuses?: EnumCampusNullableListFilter<"Course">
    facultyId?: StringNullableWithAggregatesFilter<"Course"> | string | null
    departmentId?: StringNullableWithAggregatesFilter<"Course"> | string | null
    latestYearCheckedForNtnuData?: IntNullableWithAggregatesFilter<"Course"> | number | null
  }

  export type GradeWhereInput = {
    AND?: GradeWhereInput | GradeWhereInput[]
    OR?: GradeWhereInput[]
    NOT?: GradeWhereInput | GradeWhereInput[]
    id?: StringFilter<"Grade"> | string
    gradeACount?: IntFilter<"Grade"> | number
    gradeBCount?: IntFilter<"Grade"> | number
    gradeCCount?: IntFilter<"Grade"> | number
    gradeDCount?: IntFilter<"Grade"> | number
    gradeECount?: IntFilter<"Grade"> | number
    gradeFCount?: IntFilter<"Grade"> | number
    passedCount?: IntFilter<"Grade"> | number
    failedCount?: IntFilter<"Grade"> | number
    courseId?: StringFilter<"Grade"> | string
    semester?: EnumSemesterFilter<"Grade"> | $Enums.Semester
    year?: IntFilter<"Grade"> | number
    createdAt?: DateTimeFilter<"Grade"> | Date | string
    updatedAt?: DateTimeFilter<"Grade"> | Date | string
    course?: XOR<CourseScalarRelationFilter, CourseWhereInput>
  }

  export type GradeOrderByWithRelationInput = {
    id?: SortOrder
    gradeACount?: SortOrder
    gradeBCount?: SortOrder
    gradeCCount?: SortOrder
    gradeDCount?: SortOrder
    gradeECount?: SortOrder
    gradeFCount?: SortOrder
    passedCount?: SortOrder
    failedCount?: SortOrder
    courseId?: SortOrder
    semester?: SortOrder
    year?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    course?: CourseOrderByWithRelationInput
  }

  export type GradeWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    courseId_semester_year?: GradeCourseIdSemesterYearCompoundUniqueInput
    AND?: GradeWhereInput | GradeWhereInput[]
    OR?: GradeWhereInput[]
    NOT?: GradeWhereInput | GradeWhereInput[]
    gradeACount?: IntFilter<"Grade"> | number
    gradeBCount?: IntFilter<"Grade"> | number
    gradeCCount?: IntFilter<"Grade"> | number
    gradeDCount?: IntFilter<"Grade"> | number
    gradeECount?: IntFilter<"Grade"> | number
    gradeFCount?: IntFilter<"Grade"> | number
    passedCount?: IntFilter<"Grade"> | number
    failedCount?: IntFilter<"Grade"> | number
    courseId?: StringFilter<"Grade"> | string
    semester?: EnumSemesterFilter<"Grade"> | $Enums.Semester
    year?: IntFilter<"Grade"> | number
    createdAt?: DateTimeFilter<"Grade"> | Date | string
    updatedAt?: DateTimeFilter<"Grade"> | Date | string
    course?: XOR<CourseScalarRelationFilter, CourseWhereInput>
  }, "id" | "courseId_semester_year">

  export type GradeOrderByWithAggregationInput = {
    id?: SortOrder
    gradeACount?: SortOrder
    gradeBCount?: SortOrder
    gradeCCount?: SortOrder
    gradeDCount?: SortOrder
    gradeECount?: SortOrder
    gradeFCount?: SortOrder
    passedCount?: SortOrder
    failedCount?: SortOrder
    courseId?: SortOrder
    semester?: SortOrder
    year?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: GradeCountOrderByAggregateInput
    _avg?: GradeAvgOrderByAggregateInput
    _max?: GradeMaxOrderByAggregateInput
    _min?: GradeMinOrderByAggregateInput
    _sum?: GradeSumOrderByAggregateInput
  }

  export type GradeScalarWhereWithAggregatesInput = {
    AND?: GradeScalarWhereWithAggregatesInput | GradeScalarWhereWithAggregatesInput[]
    OR?: GradeScalarWhereWithAggregatesInput[]
    NOT?: GradeScalarWhereWithAggregatesInput | GradeScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Grade"> | string
    gradeACount?: IntWithAggregatesFilter<"Grade"> | number
    gradeBCount?: IntWithAggregatesFilter<"Grade"> | number
    gradeCCount?: IntWithAggregatesFilter<"Grade"> | number
    gradeDCount?: IntWithAggregatesFilter<"Grade"> | number
    gradeECount?: IntWithAggregatesFilter<"Grade"> | number
    gradeFCount?: IntWithAggregatesFilter<"Grade"> | number
    passedCount?: IntWithAggregatesFilter<"Grade"> | number
    failedCount?: IntWithAggregatesFilter<"Grade"> | number
    courseId?: StringWithAggregatesFilter<"Grade"> | string
    semester?: EnumSemesterWithAggregatesFilter<"Grade"> | $Enums.Semester
    year?: IntWithAggregatesFilter<"Grade"> | number
    createdAt?: DateTimeWithAggregatesFilter<"Grade"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Grade"> | Date | string
  }

  export type FacultyWhereInput = {
    AND?: FacultyWhereInput | FacultyWhereInput[]
    OR?: FacultyWhereInput[]
    NOT?: FacultyWhereInput | FacultyWhereInput[]
    id?: StringFilter<"Faculty"> | string
    nameNo?: StringFilter<"Faculty"> | string
    nameEn?: StringFilter<"Faculty"> | string
    code?: IntFilter<"Faculty"> | number
    courses?: CourseListRelationFilter
    departments?: DepartmentListRelationFilter
  }

  export type FacultyOrderByWithRelationInput = {
    id?: SortOrder
    nameNo?: SortOrder
    nameEn?: SortOrder
    code?: SortOrder
    courses?: CourseOrderByRelationAggregateInput
    departments?: DepartmentOrderByRelationAggregateInput
  }

  export type FacultyWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    code?: number
    AND?: FacultyWhereInput | FacultyWhereInput[]
    OR?: FacultyWhereInput[]
    NOT?: FacultyWhereInput | FacultyWhereInput[]
    nameNo?: StringFilter<"Faculty"> | string
    nameEn?: StringFilter<"Faculty"> | string
    courses?: CourseListRelationFilter
    departments?: DepartmentListRelationFilter
  }, "id" | "code">

  export type FacultyOrderByWithAggregationInput = {
    id?: SortOrder
    nameNo?: SortOrder
    nameEn?: SortOrder
    code?: SortOrder
    _count?: FacultyCountOrderByAggregateInput
    _avg?: FacultyAvgOrderByAggregateInput
    _max?: FacultyMaxOrderByAggregateInput
    _min?: FacultyMinOrderByAggregateInput
    _sum?: FacultySumOrderByAggregateInput
  }

  export type FacultyScalarWhereWithAggregatesInput = {
    AND?: FacultyScalarWhereWithAggregatesInput | FacultyScalarWhereWithAggregatesInput[]
    OR?: FacultyScalarWhereWithAggregatesInput[]
    NOT?: FacultyScalarWhereWithAggregatesInput | FacultyScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Faculty"> | string
    nameNo?: StringWithAggregatesFilter<"Faculty"> | string
    nameEn?: StringWithAggregatesFilter<"Faculty"> | string
    code?: IntWithAggregatesFilter<"Faculty"> | number
  }

  export type DepartmentWhereInput = {
    AND?: DepartmentWhereInput | DepartmentWhereInput[]
    OR?: DepartmentWhereInput[]
    NOT?: DepartmentWhereInput | DepartmentWhereInput[]
    id?: StringFilter<"Department"> | string
    nameNo?: StringFilter<"Department"> | string
    nameEn?: StringFilter<"Department"> | string
    code?: IntFilter<"Department"> | number
    facultyId?: StringFilter<"Department"> | string
    courses?: CourseListRelationFilter
    faculty?: XOR<FacultyScalarRelationFilter, FacultyWhereInput>
  }

  export type DepartmentOrderByWithRelationInput = {
    id?: SortOrder
    nameNo?: SortOrder
    nameEn?: SortOrder
    code?: SortOrder
    facultyId?: SortOrder
    courses?: CourseOrderByRelationAggregateInput
    faculty?: FacultyOrderByWithRelationInput
  }

  export type DepartmentWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    code?: number
    AND?: DepartmentWhereInput | DepartmentWhereInput[]
    OR?: DepartmentWhereInput[]
    NOT?: DepartmentWhereInput | DepartmentWhereInput[]
    nameNo?: StringFilter<"Department"> | string
    nameEn?: StringFilter<"Department"> | string
    facultyId?: StringFilter<"Department"> | string
    courses?: CourseListRelationFilter
    faculty?: XOR<FacultyScalarRelationFilter, FacultyWhereInput>
  }, "id" | "code">

  export type DepartmentOrderByWithAggregationInput = {
    id?: SortOrder
    nameNo?: SortOrder
    nameEn?: SortOrder
    code?: SortOrder
    facultyId?: SortOrder
    _count?: DepartmentCountOrderByAggregateInput
    _avg?: DepartmentAvgOrderByAggregateInput
    _max?: DepartmentMaxOrderByAggregateInput
    _min?: DepartmentMinOrderByAggregateInput
    _sum?: DepartmentSumOrderByAggregateInput
  }

  export type DepartmentScalarWhereWithAggregatesInput = {
    AND?: DepartmentScalarWhereWithAggregatesInput | DepartmentScalarWhereWithAggregatesInput[]
    OR?: DepartmentScalarWhereWithAggregatesInput[]
    NOT?: DepartmentScalarWhereWithAggregatesInput | DepartmentScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Department"> | string
    nameNo?: StringWithAggregatesFilter<"Department"> | string
    nameEn?: StringWithAggregatesFilter<"Department"> | string
    code?: IntWithAggregatesFilter<"Department"> | number
    facultyId?: StringWithAggregatesFilter<"Department"> | string
  }

  export type CourseCreateInput = {
    id?: string
    code: string
    nameNo: string
    nameEn?: string | null
    credits?: number | null
    studyLevel: $Enums.StudyLevel
    gradeType: $Enums.GradeType
    firstYearTaught: number
    lastYearTaught?: number | null
    contentNo?: string | null
    contentEn?: string | null
    teachingMethodsNo?: string | null
    teachingMethodsEn?: string | null
    learningOutcomesNo?: string | null
    learningOutcomesEn?: string | null
    examTypeNo?: string | null
    examTypeEn?: string | null
    candidateCount: number
    averageGrade: number
    passRate: number
    createdAt?: Date | string
    updatedAt?: Date | string
    taughtSemesters?: CourseCreatetaughtSemestersInput | $Enums.Semester[]
    teachingLanguages?: CourseCreateteachingLanguagesInput | $Enums.TeachingLanguage[]
    campuses?: CourseCreatecampusesInput | $Enums.Campus[]
    latestYearCheckedForNtnuData?: number | null
    grades?: GradeCreateNestedManyWithoutCourseInput
    faculty?: FacultyCreateNestedOneWithoutCoursesInput
    department?: DepartmentCreateNestedOneWithoutCoursesInput
  }

  export type CourseUncheckedCreateInput = {
    id?: string
    code: string
    nameNo: string
    nameEn?: string | null
    credits?: number | null
    studyLevel: $Enums.StudyLevel
    gradeType: $Enums.GradeType
    firstYearTaught: number
    lastYearTaught?: number | null
    contentNo?: string | null
    contentEn?: string | null
    teachingMethodsNo?: string | null
    teachingMethodsEn?: string | null
    learningOutcomesNo?: string | null
    learningOutcomesEn?: string | null
    examTypeNo?: string | null
    examTypeEn?: string | null
    candidateCount: number
    averageGrade: number
    passRate: number
    createdAt?: Date | string
    updatedAt?: Date | string
    taughtSemesters?: CourseCreatetaughtSemestersInput | $Enums.Semester[]
    teachingLanguages?: CourseCreateteachingLanguagesInput | $Enums.TeachingLanguage[]
    campuses?: CourseCreatecampusesInput | $Enums.Campus[]
    facultyId?: string | null
    departmentId?: string | null
    latestYearCheckedForNtnuData?: number | null
    grades?: GradeUncheckedCreateNestedManyWithoutCourseInput
  }

  export type CourseUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    nameNo?: StringFieldUpdateOperationsInput | string
    nameEn?: NullableStringFieldUpdateOperationsInput | string | null
    credits?: NullableFloatFieldUpdateOperationsInput | number | null
    studyLevel?: EnumStudyLevelFieldUpdateOperationsInput | $Enums.StudyLevel
    gradeType?: EnumGradeTypeFieldUpdateOperationsInput | $Enums.GradeType
    firstYearTaught?: IntFieldUpdateOperationsInput | number
    lastYearTaught?: NullableIntFieldUpdateOperationsInput | number | null
    contentNo?: NullableStringFieldUpdateOperationsInput | string | null
    contentEn?: NullableStringFieldUpdateOperationsInput | string | null
    teachingMethodsNo?: NullableStringFieldUpdateOperationsInput | string | null
    teachingMethodsEn?: NullableStringFieldUpdateOperationsInput | string | null
    learningOutcomesNo?: NullableStringFieldUpdateOperationsInput | string | null
    learningOutcomesEn?: NullableStringFieldUpdateOperationsInput | string | null
    examTypeNo?: NullableStringFieldUpdateOperationsInput | string | null
    examTypeEn?: NullableStringFieldUpdateOperationsInput | string | null
    candidateCount?: IntFieldUpdateOperationsInput | number
    averageGrade?: FloatFieldUpdateOperationsInput | number
    passRate?: FloatFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    taughtSemesters?: CourseUpdatetaughtSemestersInput | $Enums.Semester[]
    teachingLanguages?: CourseUpdateteachingLanguagesInput | $Enums.TeachingLanguage[]
    campuses?: CourseUpdatecampusesInput | $Enums.Campus[]
    latestYearCheckedForNtnuData?: NullableIntFieldUpdateOperationsInput | number | null
    grades?: GradeUpdateManyWithoutCourseNestedInput
    faculty?: FacultyUpdateOneWithoutCoursesNestedInput
    department?: DepartmentUpdateOneWithoutCoursesNestedInput
  }

  export type CourseUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    nameNo?: StringFieldUpdateOperationsInput | string
    nameEn?: NullableStringFieldUpdateOperationsInput | string | null
    credits?: NullableFloatFieldUpdateOperationsInput | number | null
    studyLevel?: EnumStudyLevelFieldUpdateOperationsInput | $Enums.StudyLevel
    gradeType?: EnumGradeTypeFieldUpdateOperationsInput | $Enums.GradeType
    firstYearTaught?: IntFieldUpdateOperationsInput | number
    lastYearTaught?: NullableIntFieldUpdateOperationsInput | number | null
    contentNo?: NullableStringFieldUpdateOperationsInput | string | null
    contentEn?: NullableStringFieldUpdateOperationsInput | string | null
    teachingMethodsNo?: NullableStringFieldUpdateOperationsInput | string | null
    teachingMethodsEn?: NullableStringFieldUpdateOperationsInput | string | null
    learningOutcomesNo?: NullableStringFieldUpdateOperationsInput | string | null
    learningOutcomesEn?: NullableStringFieldUpdateOperationsInput | string | null
    examTypeNo?: NullableStringFieldUpdateOperationsInput | string | null
    examTypeEn?: NullableStringFieldUpdateOperationsInput | string | null
    candidateCount?: IntFieldUpdateOperationsInput | number
    averageGrade?: FloatFieldUpdateOperationsInput | number
    passRate?: FloatFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    taughtSemesters?: CourseUpdatetaughtSemestersInput | $Enums.Semester[]
    teachingLanguages?: CourseUpdateteachingLanguagesInput | $Enums.TeachingLanguage[]
    campuses?: CourseUpdatecampusesInput | $Enums.Campus[]
    facultyId?: NullableStringFieldUpdateOperationsInput | string | null
    departmentId?: NullableStringFieldUpdateOperationsInput | string | null
    latestYearCheckedForNtnuData?: NullableIntFieldUpdateOperationsInput | number | null
    grades?: GradeUncheckedUpdateManyWithoutCourseNestedInput
  }

  export type CourseCreateManyInput = {
    id?: string
    code: string
    nameNo: string
    nameEn?: string | null
    credits?: number | null
    studyLevel: $Enums.StudyLevel
    gradeType: $Enums.GradeType
    firstYearTaught: number
    lastYearTaught?: number | null
    contentNo?: string | null
    contentEn?: string | null
    teachingMethodsNo?: string | null
    teachingMethodsEn?: string | null
    learningOutcomesNo?: string | null
    learningOutcomesEn?: string | null
    examTypeNo?: string | null
    examTypeEn?: string | null
    candidateCount: number
    averageGrade: number
    passRate: number
    createdAt?: Date | string
    updatedAt?: Date | string
    taughtSemesters?: CourseCreatetaughtSemestersInput | $Enums.Semester[]
    teachingLanguages?: CourseCreateteachingLanguagesInput | $Enums.TeachingLanguage[]
    campuses?: CourseCreatecampusesInput | $Enums.Campus[]
    facultyId?: string | null
    departmentId?: string | null
    latestYearCheckedForNtnuData?: number | null
  }

  export type CourseUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    nameNo?: StringFieldUpdateOperationsInput | string
    nameEn?: NullableStringFieldUpdateOperationsInput | string | null
    credits?: NullableFloatFieldUpdateOperationsInput | number | null
    studyLevel?: EnumStudyLevelFieldUpdateOperationsInput | $Enums.StudyLevel
    gradeType?: EnumGradeTypeFieldUpdateOperationsInput | $Enums.GradeType
    firstYearTaught?: IntFieldUpdateOperationsInput | number
    lastYearTaught?: NullableIntFieldUpdateOperationsInput | number | null
    contentNo?: NullableStringFieldUpdateOperationsInput | string | null
    contentEn?: NullableStringFieldUpdateOperationsInput | string | null
    teachingMethodsNo?: NullableStringFieldUpdateOperationsInput | string | null
    teachingMethodsEn?: NullableStringFieldUpdateOperationsInput | string | null
    learningOutcomesNo?: NullableStringFieldUpdateOperationsInput | string | null
    learningOutcomesEn?: NullableStringFieldUpdateOperationsInput | string | null
    examTypeNo?: NullableStringFieldUpdateOperationsInput | string | null
    examTypeEn?: NullableStringFieldUpdateOperationsInput | string | null
    candidateCount?: IntFieldUpdateOperationsInput | number
    averageGrade?: FloatFieldUpdateOperationsInput | number
    passRate?: FloatFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    taughtSemesters?: CourseUpdatetaughtSemestersInput | $Enums.Semester[]
    teachingLanguages?: CourseUpdateteachingLanguagesInput | $Enums.TeachingLanguage[]
    campuses?: CourseUpdatecampusesInput | $Enums.Campus[]
    latestYearCheckedForNtnuData?: NullableIntFieldUpdateOperationsInput | number | null
  }

  export type CourseUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    nameNo?: StringFieldUpdateOperationsInput | string
    nameEn?: NullableStringFieldUpdateOperationsInput | string | null
    credits?: NullableFloatFieldUpdateOperationsInput | number | null
    studyLevel?: EnumStudyLevelFieldUpdateOperationsInput | $Enums.StudyLevel
    gradeType?: EnumGradeTypeFieldUpdateOperationsInput | $Enums.GradeType
    firstYearTaught?: IntFieldUpdateOperationsInput | number
    lastYearTaught?: NullableIntFieldUpdateOperationsInput | number | null
    contentNo?: NullableStringFieldUpdateOperationsInput | string | null
    contentEn?: NullableStringFieldUpdateOperationsInput | string | null
    teachingMethodsNo?: NullableStringFieldUpdateOperationsInput | string | null
    teachingMethodsEn?: NullableStringFieldUpdateOperationsInput | string | null
    learningOutcomesNo?: NullableStringFieldUpdateOperationsInput | string | null
    learningOutcomesEn?: NullableStringFieldUpdateOperationsInput | string | null
    examTypeNo?: NullableStringFieldUpdateOperationsInput | string | null
    examTypeEn?: NullableStringFieldUpdateOperationsInput | string | null
    candidateCount?: IntFieldUpdateOperationsInput | number
    averageGrade?: FloatFieldUpdateOperationsInput | number
    passRate?: FloatFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    taughtSemesters?: CourseUpdatetaughtSemestersInput | $Enums.Semester[]
    teachingLanguages?: CourseUpdateteachingLanguagesInput | $Enums.TeachingLanguage[]
    campuses?: CourseUpdatecampusesInput | $Enums.Campus[]
    facultyId?: NullableStringFieldUpdateOperationsInput | string | null
    departmentId?: NullableStringFieldUpdateOperationsInput | string | null
    latestYearCheckedForNtnuData?: NullableIntFieldUpdateOperationsInput | number | null
  }

  export type GradeCreateInput = {
    id?: string
    gradeACount: number
    gradeBCount: number
    gradeCCount: number
    gradeDCount: number
    gradeECount: number
    gradeFCount: number
    passedCount: number
    failedCount: number
    semester: $Enums.Semester
    year: number
    createdAt?: Date | string
    updatedAt?: Date | string
    course: CourseCreateNestedOneWithoutGradesInput
  }

  export type GradeUncheckedCreateInput = {
    id?: string
    gradeACount: number
    gradeBCount: number
    gradeCCount: number
    gradeDCount: number
    gradeECount: number
    gradeFCount: number
    passedCount: number
    failedCount: number
    courseId: string
    semester: $Enums.Semester
    year: number
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type GradeUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    gradeACount?: IntFieldUpdateOperationsInput | number
    gradeBCount?: IntFieldUpdateOperationsInput | number
    gradeCCount?: IntFieldUpdateOperationsInput | number
    gradeDCount?: IntFieldUpdateOperationsInput | number
    gradeECount?: IntFieldUpdateOperationsInput | number
    gradeFCount?: IntFieldUpdateOperationsInput | number
    passedCount?: IntFieldUpdateOperationsInput | number
    failedCount?: IntFieldUpdateOperationsInput | number
    semester?: EnumSemesterFieldUpdateOperationsInput | $Enums.Semester
    year?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    course?: CourseUpdateOneRequiredWithoutGradesNestedInput
  }

  export type GradeUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    gradeACount?: IntFieldUpdateOperationsInput | number
    gradeBCount?: IntFieldUpdateOperationsInput | number
    gradeCCount?: IntFieldUpdateOperationsInput | number
    gradeDCount?: IntFieldUpdateOperationsInput | number
    gradeECount?: IntFieldUpdateOperationsInput | number
    gradeFCount?: IntFieldUpdateOperationsInput | number
    passedCount?: IntFieldUpdateOperationsInput | number
    failedCount?: IntFieldUpdateOperationsInput | number
    courseId?: StringFieldUpdateOperationsInput | string
    semester?: EnumSemesterFieldUpdateOperationsInput | $Enums.Semester
    year?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type GradeCreateManyInput = {
    id?: string
    gradeACount: number
    gradeBCount: number
    gradeCCount: number
    gradeDCount: number
    gradeECount: number
    gradeFCount: number
    passedCount: number
    failedCount: number
    courseId: string
    semester: $Enums.Semester
    year: number
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type GradeUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    gradeACount?: IntFieldUpdateOperationsInput | number
    gradeBCount?: IntFieldUpdateOperationsInput | number
    gradeCCount?: IntFieldUpdateOperationsInput | number
    gradeDCount?: IntFieldUpdateOperationsInput | number
    gradeECount?: IntFieldUpdateOperationsInput | number
    gradeFCount?: IntFieldUpdateOperationsInput | number
    passedCount?: IntFieldUpdateOperationsInput | number
    failedCount?: IntFieldUpdateOperationsInput | number
    semester?: EnumSemesterFieldUpdateOperationsInput | $Enums.Semester
    year?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type GradeUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    gradeACount?: IntFieldUpdateOperationsInput | number
    gradeBCount?: IntFieldUpdateOperationsInput | number
    gradeCCount?: IntFieldUpdateOperationsInput | number
    gradeDCount?: IntFieldUpdateOperationsInput | number
    gradeECount?: IntFieldUpdateOperationsInput | number
    gradeFCount?: IntFieldUpdateOperationsInput | number
    passedCount?: IntFieldUpdateOperationsInput | number
    failedCount?: IntFieldUpdateOperationsInput | number
    courseId?: StringFieldUpdateOperationsInput | string
    semester?: EnumSemesterFieldUpdateOperationsInput | $Enums.Semester
    year?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type FacultyCreateInput = {
    id?: string
    nameNo: string
    nameEn: string
    code: number
    courses?: CourseCreateNestedManyWithoutFacultyInput
    departments?: DepartmentCreateNestedManyWithoutFacultyInput
  }

  export type FacultyUncheckedCreateInput = {
    id?: string
    nameNo: string
    nameEn: string
    code: number
    courses?: CourseUncheckedCreateNestedManyWithoutFacultyInput
    departments?: DepartmentUncheckedCreateNestedManyWithoutFacultyInput
  }

  export type FacultyUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    nameNo?: StringFieldUpdateOperationsInput | string
    nameEn?: StringFieldUpdateOperationsInput | string
    code?: IntFieldUpdateOperationsInput | number
    courses?: CourseUpdateManyWithoutFacultyNestedInput
    departments?: DepartmentUpdateManyWithoutFacultyNestedInput
  }

  export type FacultyUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    nameNo?: StringFieldUpdateOperationsInput | string
    nameEn?: StringFieldUpdateOperationsInput | string
    code?: IntFieldUpdateOperationsInput | number
    courses?: CourseUncheckedUpdateManyWithoutFacultyNestedInput
    departments?: DepartmentUncheckedUpdateManyWithoutFacultyNestedInput
  }

  export type FacultyCreateManyInput = {
    id?: string
    nameNo: string
    nameEn: string
    code: number
  }

  export type FacultyUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    nameNo?: StringFieldUpdateOperationsInput | string
    nameEn?: StringFieldUpdateOperationsInput | string
    code?: IntFieldUpdateOperationsInput | number
  }

  export type FacultyUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    nameNo?: StringFieldUpdateOperationsInput | string
    nameEn?: StringFieldUpdateOperationsInput | string
    code?: IntFieldUpdateOperationsInput | number
  }

  export type DepartmentCreateInput = {
    id?: string
    nameNo: string
    nameEn: string
    code: number
    courses?: CourseCreateNestedManyWithoutDepartmentInput
    faculty: FacultyCreateNestedOneWithoutDepartmentsInput
  }

  export type DepartmentUncheckedCreateInput = {
    id?: string
    nameNo: string
    nameEn: string
    code: number
    facultyId: string
    courses?: CourseUncheckedCreateNestedManyWithoutDepartmentInput
  }

  export type DepartmentUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    nameNo?: StringFieldUpdateOperationsInput | string
    nameEn?: StringFieldUpdateOperationsInput | string
    code?: IntFieldUpdateOperationsInput | number
    courses?: CourseUpdateManyWithoutDepartmentNestedInput
    faculty?: FacultyUpdateOneRequiredWithoutDepartmentsNestedInput
  }

  export type DepartmentUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    nameNo?: StringFieldUpdateOperationsInput | string
    nameEn?: StringFieldUpdateOperationsInput | string
    code?: IntFieldUpdateOperationsInput | number
    facultyId?: StringFieldUpdateOperationsInput | string
    courses?: CourseUncheckedUpdateManyWithoutDepartmentNestedInput
  }

  export type DepartmentCreateManyInput = {
    id?: string
    nameNo: string
    nameEn: string
    code: number
    facultyId: string
  }

  export type DepartmentUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    nameNo?: StringFieldUpdateOperationsInput | string
    nameEn?: StringFieldUpdateOperationsInput | string
    code?: IntFieldUpdateOperationsInput | number
  }

  export type DepartmentUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    nameNo?: StringFieldUpdateOperationsInput | string
    nameEn?: StringFieldUpdateOperationsInput | string
    code?: IntFieldUpdateOperationsInput | number
    facultyId?: StringFieldUpdateOperationsInput | string
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type FloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
  }

  export type EnumStudyLevelFilter<$PrismaModel = never> = {
    equals?: $Enums.StudyLevel | EnumStudyLevelFieldRefInput<$PrismaModel>
    in?: $Enums.StudyLevel[] | ListEnumStudyLevelFieldRefInput<$PrismaModel>
    notIn?: $Enums.StudyLevel[] | ListEnumStudyLevelFieldRefInput<$PrismaModel>
    not?: NestedEnumStudyLevelFilter<$PrismaModel> | $Enums.StudyLevel
  }

  export type EnumGradeTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.GradeType | EnumGradeTypeFieldRefInput<$PrismaModel>
    in?: $Enums.GradeType[] | ListEnumGradeTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.GradeType[] | ListEnumGradeTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumGradeTypeFilter<$PrismaModel> | $Enums.GradeType
  }

  export type IntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type IntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type FloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type EnumSemesterNullableListFilter<$PrismaModel = never> = {
    equals?: $Enums.Semester[] | ListEnumSemesterFieldRefInput<$PrismaModel> | null
    has?: $Enums.Semester | EnumSemesterFieldRefInput<$PrismaModel> | null
    hasEvery?: $Enums.Semester[] | ListEnumSemesterFieldRefInput<$PrismaModel>
    hasSome?: $Enums.Semester[] | ListEnumSemesterFieldRefInput<$PrismaModel>
    isEmpty?: boolean
  }

  export type EnumTeachingLanguageNullableListFilter<$PrismaModel = never> = {
    equals?: $Enums.TeachingLanguage[] | ListEnumTeachingLanguageFieldRefInput<$PrismaModel> | null
    has?: $Enums.TeachingLanguage | EnumTeachingLanguageFieldRefInput<$PrismaModel> | null
    hasEvery?: $Enums.TeachingLanguage[] | ListEnumTeachingLanguageFieldRefInput<$PrismaModel>
    hasSome?: $Enums.TeachingLanguage[] | ListEnumTeachingLanguageFieldRefInput<$PrismaModel>
    isEmpty?: boolean
  }

  export type EnumCampusNullableListFilter<$PrismaModel = never> = {
    equals?: $Enums.Campus[] | ListEnumCampusFieldRefInput<$PrismaModel> | null
    has?: $Enums.Campus | EnumCampusFieldRefInput<$PrismaModel> | null
    hasEvery?: $Enums.Campus[] | ListEnumCampusFieldRefInput<$PrismaModel>
    hasSome?: $Enums.Campus[] | ListEnumCampusFieldRefInput<$PrismaModel>
    isEmpty?: boolean
  }

  export type GradeListRelationFilter = {
    every?: GradeWhereInput
    some?: GradeWhereInput
    none?: GradeWhereInput
  }

  export type FacultyNullableScalarRelationFilter = {
    is?: FacultyWhereInput | null
    isNot?: FacultyWhereInput | null
  }

  export type DepartmentNullableScalarRelationFilter = {
    is?: DepartmentWhereInput | null
    isNot?: DepartmentWhereInput | null
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type GradeOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type CourseCountOrderByAggregateInput = {
    id?: SortOrder
    code?: SortOrder
    nameNo?: SortOrder
    nameEn?: SortOrder
    credits?: SortOrder
    studyLevel?: SortOrder
    gradeType?: SortOrder
    firstYearTaught?: SortOrder
    lastYearTaught?: SortOrder
    contentNo?: SortOrder
    contentEn?: SortOrder
    teachingMethodsNo?: SortOrder
    teachingMethodsEn?: SortOrder
    learningOutcomesNo?: SortOrder
    learningOutcomesEn?: SortOrder
    examTypeNo?: SortOrder
    examTypeEn?: SortOrder
    candidateCount?: SortOrder
    averageGrade?: SortOrder
    passRate?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    taughtSemesters?: SortOrder
    teachingLanguages?: SortOrder
    campuses?: SortOrder
    facultyId?: SortOrder
    departmentId?: SortOrder
    latestYearCheckedForNtnuData?: SortOrder
  }

  export type CourseAvgOrderByAggregateInput = {
    credits?: SortOrder
    firstYearTaught?: SortOrder
    lastYearTaught?: SortOrder
    candidateCount?: SortOrder
    averageGrade?: SortOrder
    passRate?: SortOrder
    latestYearCheckedForNtnuData?: SortOrder
  }

  export type CourseMaxOrderByAggregateInput = {
    id?: SortOrder
    code?: SortOrder
    nameNo?: SortOrder
    nameEn?: SortOrder
    credits?: SortOrder
    studyLevel?: SortOrder
    gradeType?: SortOrder
    firstYearTaught?: SortOrder
    lastYearTaught?: SortOrder
    contentNo?: SortOrder
    contentEn?: SortOrder
    teachingMethodsNo?: SortOrder
    teachingMethodsEn?: SortOrder
    learningOutcomesNo?: SortOrder
    learningOutcomesEn?: SortOrder
    examTypeNo?: SortOrder
    examTypeEn?: SortOrder
    candidateCount?: SortOrder
    averageGrade?: SortOrder
    passRate?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    facultyId?: SortOrder
    departmentId?: SortOrder
    latestYearCheckedForNtnuData?: SortOrder
  }

  export type CourseMinOrderByAggregateInput = {
    id?: SortOrder
    code?: SortOrder
    nameNo?: SortOrder
    nameEn?: SortOrder
    credits?: SortOrder
    studyLevel?: SortOrder
    gradeType?: SortOrder
    firstYearTaught?: SortOrder
    lastYearTaught?: SortOrder
    contentNo?: SortOrder
    contentEn?: SortOrder
    teachingMethodsNo?: SortOrder
    teachingMethodsEn?: SortOrder
    learningOutcomesNo?: SortOrder
    learningOutcomesEn?: SortOrder
    examTypeNo?: SortOrder
    examTypeEn?: SortOrder
    candidateCount?: SortOrder
    averageGrade?: SortOrder
    passRate?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    facultyId?: SortOrder
    departmentId?: SortOrder
    latestYearCheckedForNtnuData?: SortOrder
  }

  export type CourseSumOrderByAggregateInput = {
    credits?: SortOrder
    firstYearTaught?: SortOrder
    lastYearTaught?: SortOrder
    candidateCount?: SortOrder
    averageGrade?: SortOrder
    passRate?: SortOrder
    latestYearCheckedForNtnuData?: SortOrder
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type FloatNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedFloatNullableFilter<$PrismaModel>
    _min?: NestedFloatNullableFilter<$PrismaModel>
    _max?: NestedFloatNullableFilter<$PrismaModel>
  }

  export type EnumStudyLevelWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.StudyLevel | EnumStudyLevelFieldRefInput<$PrismaModel>
    in?: $Enums.StudyLevel[] | ListEnumStudyLevelFieldRefInput<$PrismaModel>
    notIn?: $Enums.StudyLevel[] | ListEnumStudyLevelFieldRefInput<$PrismaModel>
    not?: NestedEnumStudyLevelWithAggregatesFilter<$PrismaModel> | $Enums.StudyLevel
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumStudyLevelFilter<$PrismaModel>
    _max?: NestedEnumStudyLevelFilter<$PrismaModel>
  }

  export type EnumGradeTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.GradeType | EnumGradeTypeFieldRefInput<$PrismaModel>
    in?: $Enums.GradeType[] | ListEnumGradeTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.GradeType[] | ListEnumGradeTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumGradeTypeWithAggregatesFilter<$PrismaModel> | $Enums.GradeType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumGradeTypeFilter<$PrismaModel>
    _max?: NestedEnumGradeTypeFilter<$PrismaModel>
  }

  export type IntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type IntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type FloatWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedFloatFilter<$PrismaModel>
    _min?: NestedFloatFilter<$PrismaModel>
    _max?: NestedFloatFilter<$PrismaModel>
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type EnumSemesterFilter<$PrismaModel = never> = {
    equals?: $Enums.Semester | EnumSemesterFieldRefInput<$PrismaModel>
    in?: $Enums.Semester[] | ListEnumSemesterFieldRefInput<$PrismaModel>
    notIn?: $Enums.Semester[] | ListEnumSemesterFieldRefInput<$PrismaModel>
    not?: NestedEnumSemesterFilter<$PrismaModel> | $Enums.Semester
  }

  export type CourseScalarRelationFilter = {
    is?: CourseWhereInput
    isNot?: CourseWhereInput
  }

  export type GradeCourseIdSemesterYearCompoundUniqueInput = {
    courseId: string
    semester: $Enums.Semester
    year: number
  }

  export type GradeCountOrderByAggregateInput = {
    id?: SortOrder
    gradeACount?: SortOrder
    gradeBCount?: SortOrder
    gradeCCount?: SortOrder
    gradeDCount?: SortOrder
    gradeECount?: SortOrder
    gradeFCount?: SortOrder
    passedCount?: SortOrder
    failedCount?: SortOrder
    courseId?: SortOrder
    semester?: SortOrder
    year?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type GradeAvgOrderByAggregateInput = {
    gradeACount?: SortOrder
    gradeBCount?: SortOrder
    gradeCCount?: SortOrder
    gradeDCount?: SortOrder
    gradeECount?: SortOrder
    gradeFCount?: SortOrder
    passedCount?: SortOrder
    failedCount?: SortOrder
    year?: SortOrder
  }

  export type GradeMaxOrderByAggregateInput = {
    id?: SortOrder
    gradeACount?: SortOrder
    gradeBCount?: SortOrder
    gradeCCount?: SortOrder
    gradeDCount?: SortOrder
    gradeECount?: SortOrder
    gradeFCount?: SortOrder
    passedCount?: SortOrder
    failedCount?: SortOrder
    courseId?: SortOrder
    semester?: SortOrder
    year?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type GradeMinOrderByAggregateInput = {
    id?: SortOrder
    gradeACount?: SortOrder
    gradeBCount?: SortOrder
    gradeCCount?: SortOrder
    gradeDCount?: SortOrder
    gradeECount?: SortOrder
    gradeFCount?: SortOrder
    passedCount?: SortOrder
    failedCount?: SortOrder
    courseId?: SortOrder
    semester?: SortOrder
    year?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type GradeSumOrderByAggregateInput = {
    gradeACount?: SortOrder
    gradeBCount?: SortOrder
    gradeCCount?: SortOrder
    gradeDCount?: SortOrder
    gradeECount?: SortOrder
    gradeFCount?: SortOrder
    passedCount?: SortOrder
    failedCount?: SortOrder
    year?: SortOrder
  }

  export type EnumSemesterWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.Semester | EnumSemesterFieldRefInput<$PrismaModel>
    in?: $Enums.Semester[] | ListEnumSemesterFieldRefInput<$PrismaModel>
    notIn?: $Enums.Semester[] | ListEnumSemesterFieldRefInput<$PrismaModel>
    not?: NestedEnumSemesterWithAggregatesFilter<$PrismaModel> | $Enums.Semester
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumSemesterFilter<$PrismaModel>
    _max?: NestedEnumSemesterFilter<$PrismaModel>
  }

  export type CourseListRelationFilter = {
    every?: CourseWhereInput
    some?: CourseWhereInput
    none?: CourseWhereInput
  }

  export type DepartmentListRelationFilter = {
    every?: DepartmentWhereInput
    some?: DepartmentWhereInput
    none?: DepartmentWhereInput
  }

  export type CourseOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type DepartmentOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type FacultyCountOrderByAggregateInput = {
    id?: SortOrder
    nameNo?: SortOrder
    nameEn?: SortOrder
    code?: SortOrder
  }

  export type FacultyAvgOrderByAggregateInput = {
    code?: SortOrder
  }

  export type FacultyMaxOrderByAggregateInput = {
    id?: SortOrder
    nameNo?: SortOrder
    nameEn?: SortOrder
    code?: SortOrder
  }

  export type FacultyMinOrderByAggregateInput = {
    id?: SortOrder
    nameNo?: SortOrder
    nameEn?: SortOrder
    code?: SortOrder
  }

  export type FacultySumOrderByAggregateInput = {
    code?: SortOrder
  }

  export type FacultyScalarRelationFilter = {
    is?: FacultyWhereInput
    isNot?: FacultyWhereInput
  }

  export type DepartmentCountOrderByAggregateInput = {
    id?: SortOrder
    nameNo?: SortOrder
    nameEn?: SortOrder
    code?: SortOrder
    facultyId?: SortOrder
  }

  export type DepartmentAvgOrderByAggregateInput = {
    code?: SortOrder
  }

  export type DepartmentMaxOrderByAggregateInput = {
    id?: SortOrder
    nameNo?: SortOrder
    nameEn?: SortOrder
    code?: SortOrder
    facultyId?: SortOrder
  }

  export type DepartmentMinOrderByAggregateInput = {
    id?: SortOrder
    nameNo?: SortOrder
    nameEn?: SortOrder
    code?: SortOrder
    facultyId?: SortOrder
  }

  export type DepartmentSumOrderByAggregateInput = {
    code?: SortOrder
  }

  export type CourseCreatetaughtSemestersInput = {
    set: $Enums.Semester[]
  }

  export type CourseCreateteachingLanguagesInput = {
    set: $Enums.TeachingLanguage[]
  }

  export type CourseCreatecampusesInput = {
    set: $Enums.Campus[]
  }

  export type GradeCreateNestedManyWithoutCourseInput = {
    create?: XOR<GradeCreateWithoutCourseInput, GradeUncheckedCreateWithoutCourseInput> | GradeCreateWithoutCourseInput[] | GradeUncheckedCreateWithoutCourseInput[]
    connectOrCreate?: GradeCreateOrConnectWithoutCourseInput | GradeCreateOrConnectWithoutCourseInput[]
    createMany?: GradeCreateManyCourseInputEnvelope
    connect?: GradeWhereUniqueInput | GradeWhereUniqueInput[]
  }

  export type FacultyCreateNestedOneWithoutCoursesInput = {
    create?: XOR<FacultyCreateWithoutCoursesInput, FacultyUncheckedCreateWithoutCoursesInput>
    connectOrCreate?: FacultyCreateOrConnectWithoutCoursesInput
    connect?: FacultyWhereUniqueInput
  }

  export type DepartmentCreateNestedOneWithoutCoursesInput = {
    create?: XOR<DepartmentCreateWithoutCoursesInput, DepartmentUncheckedCreateWithoutCoursesInput>
    connectOrCreate?: DepartmentCreateOrConnectWithoutCoursesInput
    connect?: DepartmentWhereUniqueInput
  }

  export type GradeUncheckedCreateNestedManyWithoutCourseInput = {
    create?: XOR<GradeCreateWithoutCourseInput, GradeUncheckedCreateWithoutCourseInput> | GradeCreateWithoutCourseInput[] | GradeUncheckedCreateWithoutCourseInput[]
    connectOrCreate?: GradeCreateOrConnectWithoutCourseInput | GradeCreateOrConnectWithoutCourseInput[]
    createMany?: GradeCreateManyCourseInputEnvelope
    connect?: GradeWhereUniqueInput | GradeWhereUniqueInput[]
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type NullableFloatFieldUpdateOperationsInput = {
    set?: number | null
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type EnumStudyLevelFieldUpdateOperationsInput = {
    set?: $Enums.StudyLevel
  }

  export type EnumGradeTypeFieldUpdateOperationsInput = {
    set?: $Enums.GradeType
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type NullableIntFieldUpdateOperationsInput = {
    set?: number | null
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type FloatFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type CourseUpdatetaughtSemestersInput = {
    set?: $Enums.Semester[]
    push?: $Enums.Semester | $Enums.Semester[]
  }

  export type CourseUpdateteachingLanguagesInput = {
    set?: $Enums.TeachingLanguage[]
    push?: $Enums.TeachingLanguage | $Enums.TeachingLanguage[]
  }

  export type CourseUpdatecampusesInput = {
    set?: $Enums.Campus[]
    push?: $Enums.Campus | $Enums.Campus[]
  }

  export type GradeUpdateManyWithoutCourseNestedInput = {
    create?: XOR<GradeCreateWithoutCourseInput, GradeUncheckedCreateWithoutCourseInput> | GradeCreateWithoutCourseInput[] | GradeUncheckedCreateWithoutCourseInput[]
    connectOrCreate?: GradeCreateOrConnectWithoutCourseInput | GradeCreateOrConnectWithoutCourseInput[]
    upsert?: GradeUpsertWithWhereUniqueWithoutCourseInput | GradeUpsertWithWhereUniqueWithoutCourseInput[]
    createMany?: GradeCreateManyCourseInputEnvelope
    set?: GradeWhereUniqueInput | GradeWhereUniqueInput[]
    disconnect?: GradeWhereUniqueInput | GradeWhereUniqueInput[]
    delete?: GradeWhereUniqueInput | GradeWhereUniqueInput[]
    connect?: GradeWhereUniqueInput | GradeWhereUniqueInput[]
    update?: GradeUpdateWithWhereUniqueWithoutCourseInput | GradeUpdateWithWhereUniqueWithoutCourseInput[]
    updateMany?: GradeUpdateManyWithWhereWithoutCourseInput | GradeUpdateManyWithWhereWithoutCourseInput[]
    deleteMany?: GradeScalarWhereInput | GradeScalarWhereInput[]
  }

  export type FacultyUpdateOneWithoutCoursesNestedInput = {
    create?: XOR<FacultyCreateWithoutCoursesInput, FacultyUncheckedCreateWithoutCoursesInput>
    connectOrCreate?: FacultyCreateOrConnectWithoutCoursesInput
    upsert?: FacultyUpsertWithoutCoursesInput
    disconnect?: FacultyWhereInput | boolean
    delete?: FacultyWhereInput | boolean
    connect?: FacultyWhereUniqueInput
    update?: XOR<XOR<FacultyUpdateToOneWithWhereWithoutCoursesInput, FacultyUpdateWithoutCoursesInput>, FacultyUncheckedUpdateWithoutCoursesInput>
  }

  export type DepartmentUpdateOneWithoutCoursesNestedInput = {
    create?: XOR<DepartmentCreateWithoutCoursesInput, DepartmentUncheckedCreateWithoutCoursesInput>
    connectOrCreate?: DepartmentCreateOrConnectWithoutCoursesInput
    upsert?: DepartmentUpsertWithoutCoursesInput
    disconnect?: DepartmentWhereInput | boolean
    delete?: DepartmentWhereInput | boolean
    connect?: DepartmentWhereUniqueInput
    update?: XOR<XOR<DepartmentUpdateToOneWithWhereWithoutCoursesInput, DepartmentUpdateWithoutCoursesInput>, DepartmentUncheckedUpdateWithoutCoursesInput>
  }

  export type GradeUncheckedUpdateManyWithoutCourseNestedInput = {
    create?: XOR<GradeCreateWithoutCourseInput, GradeUncheckedCreateWithoutCourseInput> | GradeCreateWithoutCourseInput[] | GradeUncheckedCreateWithoutCourseInput[]
    connectOrCreate?: GradeCreateOrConnectWithoutCourseInput | GradeCreateOrConnectWithoutCourseInput[]
    upsert?: GradeUpsertWithWhereUniqueWithoutCourseInput | GradeUpsertWithWhereUniqueWithoutCourseInput[]
    createMany?: GradeCreateManyCourseInputEnvelope
    set?: GradeWhereUniqueInput | GradeWhereUniqueInput[]
    disconnect?: GradeWhereUniqueInput | GradeWhereUniqueInput[]
    delete?: GradeWhereUniqueInput | GradeWhereUniqueInput[]
    connect?: GradeWhereUniqueInput | GradeWhereUniqueInput[]
    update?: GradeUpdateWithWhereUniqueWithoutCourseInput | GradeUpdateWithWhereUniqueWithoutCourseInput[]
    updateMany?: GradeUpdateManyWithWhereWithoutCourseInput | GradeUpdateManyWithWhereWithoutCourseInput[]
    deleteMany?: GradeScalarWhereInput | GradeScalarWhereInput[]
  }

  export type CourseCreateNestedOneWithoutGradesInput = {
    create?: XOR<CourseCreateWithoutGradesInput, CourseUncheckedCreateWithoutGradesInput>
    connectOrCreate?: CourseCreateOrConnectWithoutGradesInput
    connect?: CourseWhereUniqueInput
  }

  export type EnumSemesterFieldUpdateOperationsInput = {
    set?: $Enums.Semester
  }

  export type CourseUpdateOneRequiredWithoutGradesNestedInput = {
    create?: XOR<CourseCreateWithoutGradesInput, CourseUncheckedCreateWithoutGradesInput>
    connectOrCreate?: CourseCreateOrConnectWithoutGradesInput
    upsert?: CourseUpsertWithoutGradesInput
    connect?: CourseWhereUniqueInput
    update?: XOR<XOR<CourseUpdateToOneWithWhereWithoutGradesInput, CourseUpdateWithoutGradesInput>, CourseUncheckedUpdateWithoutGradesInput>
  }

  export type CourseCreateNestedManyWithoutFacultyInput = {
    create?: XOR<CourseCreateWithoutFacultyInput, CourseUncheckedCreateWithoutFacultyInput> | CourseCreateWithoutFacultyInput[] | CourseUncheckedCreateWithoutFacultyInput[]
    connectOrCreate?: CourseCreateOrConnectWithoutFacultyInput | CourseCreateOrConnectWithoutFacultyInput[]
    createMany?: CourseCreateManyFacultyInputEnvelope
    connect?: CourseWhereUniqueInput | CourseWhereUniqueInput[]
  }

  export type DepartmentCreateNestedManyWithoutFacultyInput = {
    create?: XOR<DepartmentCreateWithoutFacultyInput, DepartmentUncheckedCreateWithoutFacultyInput> | DepartmentCreateWithoutFacultyInput[] | DepartmentUncheckedCreateWithoutFacultyInput[]
    connectOrCreate?: DepartmentCreateOrConnectWithoutFacultyInput | DepartmentCreateOrConnectWithoutFacultyInput[]
    createMany?: DepartmentCreateManyFacultyInputEnvelope
    connect?: DepartmentWhereUniqueInput | DepartmentWhereUniqueInput[]
  }

  export type CourseUncheckedCreateNestedManyWithoutFacultyInput = {
    create?: XOR<CourseCreateWithoutFacultyInput, CourseUncheckedCreateWithoutFacultyInput> | CourseCreateWithoutFacultyInput[] | CourseUncheckedCreateWithoutFacultyInput[]
    connectOrCreate?: CourseCreateOrConnectWithoutFacultyInput | CourseCreateOrConnectWithoutFacultyInput[]
    createMany?: CourseCreateManyFacultyInputEnvelope
    connect?: CourseWhereUniqueInput | CourseWhereUniqueInput[]
  }

  export type DepartmentUncheckedCreateNestedManyWithoutFacultyInput = {
    create?: XOR<DepartmentCreateWithoutFacultyInput, DepartmentUncheckedCreateWithoutFacultyInput> | DepartmentCreateWithoutFacultyInput[] | DepartmentUncheckedCreateWithoutFacultyInput[]
    connectOrCreate?: DepartmentCreateOrConnectWithoutFacultyInput | DepartmentCreateOrConnectWithoutFacultyInput[]
    createMany?: DepartmentCreateManyFacultyInputEnvelope
    connect?: DepartmentWhereUniqueInput | DepartmentWhereUniqueInput[]
  }

  export type CourseUpdateManyWithoutFacultyNestedInput = {
    create?: XOR<CourseCreateWithoutFacultyInput, CourseUncheckedCreateWithoutFacultyInput> | CourseCreateWithoutFacultyInput[] | CourseUncheckedCreateWithoutFacultyInput[]
    connectOrCreate?: CourseCreateOrConnectWithoutFacultyInput | CourseCreateOrConnectWithoutFacultyInput[]
    upsert?: CourseUpsertWithWhereUniqueWithoutFacultyInput | CourseUpsertWithWhereUniqueWithoutFacultyInput[]
    createMany?: CourseCreateManyFacultyInputEnvelope
    set?: CourseWhereUniqueInput | CourseWhereUniqueInput[]
    disconnect?: CourseWhereUniqueInput | CourseWhereUniqueInput[]
    delete?: CourseWhereUniqueInput | CourseWhereUniqueInput[]
    connect?: CourseWhereUniqueInput | CourseWhereUniqueInput[]
    update?: CourseUpdateWithWhereUniqueWithoutFacultyInput | CourseUpdateWithWhereUniqueWithoutFacultyInput[]
    updateMany?: CourseUpdateManyWithWhereWithoutFacultyInput | CourseUpdateManyWithWhereWithoutFacultyInput[]
    deleteMany?: CourseScalarWhereInput | CourseScalarWhereInput[]
  }

  export type DepartmentUpdateManyWithoutFacultyNestedInput = {
    create?: XOR<DepartmentCreateWithoutFacultyInput, DepartmentUncheckedCreateWithoutFacultyInput> | DepartmentCreateWithoutFacultyInput[] | DepartmentUncheckedCreateWithoutFacultyInput[]
    connectOrCreate?: DepartmentCreateOrConnectWithoutFacultyInput | DepartmentCreateOrConnectWithoutFacultyInput[]
    upsert?: DepartmentUpsertWithWhereUniqueWithoutFacultyInput | DepartmentUpsertWithWhereUniqueWithoutFacultyInput[]
    createMany?: DepartmentCreateManyFacultyInputEnvelope
    set?: DepartmentWhereUniqueInput | DepartmentWhereUniqueInput[]
    disconnect?: DepartmentWhereUniqueInput | DepartmentWhereUniqueInput[]
    delete?: DepartmentWhereUniqueInput | DepartmentWhereUniqueInput[]
    connect?: DepartmentWhereUniqueInput | DepartmentWhereUniqueInput[]
    update?: DepartmentUpdateWithWhereUniqueWithoutFacultyInput | DepartmentUpdateWithWhereUniqueWithoutFacultyInput[]
    updateMany?: DepartmentUpdateManyWithWhereWithoutFacultyInput | DepartmentUpdateManyWithWhereWithoutFacultyInput[]
    deleteMany?: DepartmentScalarWhereInput | DepartmentScalarWhereInput[]
  }

  export type CourseUncheckedUpdateManyWithoutFacultyNestedInput = {
    create?: XOR<CourseCreateWithoutFacultyInput, CourseUncheckedCreateWithoutFacultyInput> | CourseCreateWithoutFacultyInput[] | CourseUncheckedCreateWithoutFacultyInput[]
    connectOrCreate?: CourseCreateOrConnectWithoutFacultyInput | CourseCreateOrConnectWithoutFacultyInput[]
    upsert?: CourseUpsertWithWhereUniqueWithoutFacultyInput | CourseUpsertWithWhereUniqueWithoutFacultyInput[]
    createMany?: CourseCreateManyFacultyInputEnvelope
    set?: CourseWhereUniqueInput | CourseWhereUniqueInput[]
    disconnect?: CourseWhereUniqueInput | CourseWhereUniqueInput[]
    delete?: CourseWhereUniqueInput | CourseWhereUniqueInput[]
    connect?: CourseWhereUniqueInput | CourseWhereUniqueInput[]
    update?: CourseUpdateWithWhereUniqueWithoutFacultyInput | CourseUpdateWithWhereUniqueWithoutFacultyInput[]
    updateMany?: CourseUpdateManyWithWhereWithoutFacultyInput | CourseUpdateManyWithWhereWithoutFacultyInput[]
    deleteMany?: CourseScalarWhereInput | CourseScalarWhereInput[]
  }

  export type DepartmentUncheckedUpdateManyWithoutFacultyNestedInput = {
    create?: XOR<DepartmentCreateWithoutFacultyInput, DepartmentUncheckedCreateWithoutFacultyInput> | DepartmentCreateWithoutFacultyInput[] | DepartmentUncheckedCreateWithoutFacultyInput[]
    connectOrCreate?: DepartmentCreateOrConnectWithoutFacultyInput | DepartmentCreateOrConnectWithoutFacultyInput[]
    upsert?: DepartmentUpsertWithWhereUniqueWithoutFacultyInput | DepartmentUpsertWithWhereUniqueWithoutFacultyInput[]
    createMany?: DepartmentCreateManyFacultyInputEnvelope
    set?: DepartmentWhereUniqueInput | DepartmentWhereUniqueInput[]
    disconnect?: DepartmentWhereUniqueInput | DepartmentWhereUniqueInput[]
    delete?: DepartmentWhereUniqueInput | DepartmentWhereUniqueInput[]
    connect?: DepartmentWhereUniqueInput | DepartmentWhereUniqueInput[]
    update?: DepartmentUpdateWithWhereUniqueWithoutFacultyInput | DepartmentUpdateWithWhereUniqueWithoutFacultyInput[]
    updateMany?: DepartmentUpdateManyWithWhereWithoutFacultyInput | DepartmentUpdateManyWithWhereWithoutFacultyInput[]
    deleteMany?: DepartmentScalarWhereInput | DepartmentScalarWhereInput[]
  }

  export type CourseCreateNestedManyWithoutDepartmentInput = {
    create?: XOR<CourseCreateWithoutDepartmentInput, CourseUncheckedCreateWithoutDepartmentInput> | CourseCreateWithoutDepartmentInput[] | CourseUncheckedCreateWithoutDepartmentInput[]
    connectOrCreate?: CourseCreateOrConnectWithoutDepartmentInput | CourseCreateOrConnectWithoutDepartmentInput[]
    createMany?: CourseCreateManyDepartmentInputEnvelope
    connect?: CourseWhereUniqueInput | CourseWhereUniqueInput[]
  }

  export type FacultyCreateNestedOneWithoutDepartmentsInput = {
    create?: XOR<FacultyCreateWithoutDepartmentsInput, FacultyUncheckedCreateWithoutDepartmentsInput>
    connectOrCreate?: FacultyCreateOrConnectWithoutDepartmentsInput
    connect?: FacultyWhereUniqueInput
  }

  export type CourseUncheckedCreateNestedManyWithoutDepartmentInput = {
    create?: XOR<CourseCreateWithoutDepartmentInput, CourseUncheckedCreateWithoutDepartmentInput> | CourseCreateWithoutDepartmentInput[] | CourseUncheckedCreateWithoutDepartmentInput[]
    connectOrCreate?: CourseCreateOrConnectWithoutDepartmentInput | CourseCreateOrConnectWithoutDepartmentInput[]
    createMany?: CourseCreateManyDepartmentInputEnvelope
    connect?: CourseWhereUniqueInput | CourseWhereUniqueInput[]
  }

  export type CourseUpdateManyWithoutDepartmentNestedInput = {
    create?: XOR<CourseCreateWithoutDepartmentInput, CourseUncheckedCreateWithoutDepartmentInput> | CourseCreateWithoutDepartmentInput[] | CourseUncheckedCreateWithoutDepartmentInput[]
    connectOrCreate?: CourseCreateOrConnectWithoutDepartmentInput | CourseCreateOrConnectWithoutDepartmentInput[]
    upsert?: CourseUpsertWithWhereUniqueWithoutDepartmentInput | CourseUpsertWithWhereUniqueWithoutDepartmentInput[]
    createMany?: CourseCreateManyDepartmentInputEnvelope
    set?: CourseWhereUniqueInput | CourseWhereUniqueInput[]
    disconnect?: CourseWhereUniqueInput | CourseWhereUniqueInput[]
    delete?: CourseWhereUniqueInput | CourseWhereUniqueInput[]
    connect?: CourseWhereUniqueInput | CourseWhereUniqueInput[]
    update?: CourseUpdateWithWhereUniqueWithoutDepartmentInput | CourseUpdateWithWhereUniqueWithoutDepartmentInput[]
    updateMany?: CourseUpdateManyWithWhereWithoutDepartmentInput | CourseUpdateManyWithWhereWithoutDepartmentInput[]
    deleteMany?: CourseScalarWhereInput | CourseScalarWhereInput[]
  }

  export type FacultyUpdateOneRequiredWithoutDepartmentsNestedInput = {
    create?: XOR<FacultyCreateWithoutDepartmentsInput, FacultyUncheckedCreateWithoutDepartmentsInput>
    connectOrCreate?: FacultyCreateOrConnectWithoutDepartmentsInput
    upsert?: FacultyUpsertWithoutDepartmentsInput
    connect?: FacultyWhereUniqueInput
    update?: XOR<XOR<FacultyUpdateToOneWithWhereWithoutDepartmentsInput, FacultyUpdateWithoutDepartmentsInput>, FacultyUncheckedUpdateWithoutDepartmentsInput>
  }

  export type CourseUncheckedUpdateManyWithoutDepartmentNestedInput = {
    create?: XOR<CourseCreateWithoutDepartmentInput, CourseUncheckedCreateWithoutDepartmentInput> | CourseCreateWithoutDepartmentInput[] | CourseUncheckedCreateWithoutDepartmentInput[]
    connectOrCreate?: CourseCreateOrConnectWithoutDepartmentInput | CourseCreateOrConnectWithoutDepartmentInput[]
    upsert?: CourseUpsertWithWhereUniqueWithoutDepartmentInput | CourseUpsertWithWhereUniqueWithoutDepartmentInput[]
    createMany?: CourseCreateManyDepartmentInputEnvelope
    set?: CourseWhereUniqueInput | CourseWhereUniqueInput[]
    disconnect?: CourseWhereUniqueInput | CourseWhereUniqueInput[]
    delete?: CourseWhereUniqueInput | CourseWhereUniqueInput[]
    connect?: CourseWhereUniqueInput | CourseWhereUniqueInput[]
    update?: CourseUpdateWithWhereUniqueWithoutDepartmentInput | CourseUpdateWithWhereUniqueWithoutDepartmentInput[]
    updateMany?: CourseUpdateManyWithWhereWithoutDepartmentInput | CourseUpdateManyWithWhereWithoutDepartmentInput[]
    deleteMany?: CourseScalarWhereInput | CourseScalarWhereInput[]
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedFloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
  }

  export type NestedEnumStudyLevelFilter<$PrismaModel = never> = {
    equals?: $Enums.StudyLevel | EnumStudyLevelFieldRefInput<$PrismaModel>
    in?: $Enums.StudyLevel[] | ListEnumStudyLevelFieldRefInput<$PrismaModel>
    notIn?: $Enums.StudyLevel[] | ListEnumStudyLevelFieldRefInput<$PrismaModel>
    not?: NestedEnumStudyLevelFilter<$PrismaModel> | $Enums.StudyLevel
  }

  export type NestedEnumGradeTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.GradeType | EnumGradeTypeFieldRefInput<$PrismaModel>
    in?: $Enums.GradeType[] | ListEnumGradeTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.GradeType[] | ListEnumGradeTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumGradeTypeFilter<$PrismaModel> | $Enums.GradeType
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedFloatNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedFloatNullableFilter<$PrismaModel>
    _min?: NestedFloatNullableFilter<$PrismaModel>
    _max?: NestedFloatNullableFilter<$PrismaModel>
  }

  export type NestedEnumStudyLevelWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.StudyLevel | EnumStudyLevelFieldRefInput<$PrismaModel>
    in?: $Enums.StudyLevel[] | ListEnumStudyLevelFieldRefInput<$PrismaModel>
    notIn?: $Enums.StudyLevel[] | ListEnumStudyLevelFieldRefInput<$PrismaModel>
    not?: NestedEnumStudyLevelWithAggregatesFilter<$PrismaModel> | $Enums.StudyLevel
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumStudyLevelFilter<$PrismaModel>
    _max?: NestedEnumStudyLevelFilter<$PrismaModel>
  }

  export type NestedEnumGradeTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.GradeType | EnumGradeTypeFieldRefInput<$PrismaModel>
    in?: $Enums.GradeType[] | ListEnumGradeTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.GradeType[] | ListEnumGradeTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumGradeTypeWithAggregatesFilter<$PrismaModel> | $Enums.GradeType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumGradeTypeFilter<$PrismaModel>
    _max?: NestedEnumGradeTypeFilter<$PrismaModel>
  }

  export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type NestedIntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type NestedFloatWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedFloatFilter<$PrismaModel>
    _min?: NestedFloatFilter<$PrismaModel>
    _max?: NestedFloatFilter<$PrismaModel>
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type NestedEnumSemesterFilter<$PrismaModel = never> = {
    equals?: $Enums.Semester | EnumSemesterFieldRefInput<$PrismaModel>
    in?: $Enums.Semester[] | ListEnumSemesterFieldRefInput<$PrismaModel>
    notIn?: $Enums.Semester[] | ListEnumSemesterFieldRefInput<$PrismaModel>
    not?: NestedEnumSemesterFilter<$PrismaModel> | $Enums.Semester
  }

  export type NestedEnumSemesterWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.Semester | EnumSemesterFieldRefInput<$PrismaModel>
    in?: $Enums.Semester[] | ListEnumSemesterFieldRefInput<$PrismaModel>
    notIn?: $Enums.Semester[] | ListEnumSemesterFieldRefInput<$PrismaModel>
    not?: NestedEnumSemesterWithAggregatesFilter<$PrismaModel> | $Enums.Semester
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumSemesterFilter<$PrismaModel>
    _max?: NestedEnumSemesterFilter<$PrismaModel>
  }

  export type GradeCreateWithoutCourseInput = {
    id?: string
    gradeACount: number
    gradeBCount: number
    gradeCCount: number
    gradeDCount: number
    gradeECount: number
    gradeFCount: number
    passedCount: number
    failedCount: number
    semester: $Enums.Semester
    year: number
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type GradeUncheckedCreateWithoutCourseInput = {
    id?: string
    gradeACount: number
    gradeBCount: number
    gradeCCount: number
    gradeDCount: number
    gradeECount: number
    gradeFCount: number
    passedCount: number
    failedCount: number
    semester: $Enums.Semester
    year: number
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type GradeCreateOrConnectWithoutCourseInput = {
    where: GradeWhereUniqueInput
    create: XOR<GradeCreateWithoutCourseInput, GradeUncheckedCreateWithoutCourseInput>
  }

  export type GradeCreateManyCourseInputEnvelope = {
    data: GradeCreateManyCourseInput | GradeCreateManyCourseInput[]
    skipDuplicates?: boolean
  }

  export type FacultyCreateWithoutCoursesInput = {
    id?: string
    nameNo: string
    nameEn: string
    code: number
    departments?: DepartmentCreateNestedManyWithoutFacultyInput
  }

  export type FacultyUncheckedCreateWithoutCoursesInput = {
    id?: string
    nameNo: string
    nameEn: string
    code: number
    departments?: DepartmentUncheckedCreateNestedManyWithoutFacultyInput
  }

  export type FacultyCreateOrConnectWithoutCoursesInput = {
    where: FacultyWhereUniqueInput
    create: XOR<FacultyCreateWithoutCoursesInput, FacultyUncheckedCreateWithoutCoursesInput>
  }

  export type DepartmentCreateWithoutCoursesInput = {
    id?: string
    nameNo: string
    nameEn: string
    code: number
    faculty: FacultyCreateNestedOneWithoutDepartmentsInput
  }

  export type DepartmentUncheckedCreateWithoutCoursesInput = {
    id?: string
    nameNo: string
    nameEn: string
    code: number
    facultyId: string
  }

  export type DepartmentCreateOrConnectWithoutCoursesInput = {
    where: DepartmentWhereUniqueInput
    create: XOR<DepartmentCreateWithoutCoursesInput, DepartmentUncheckedCreateWithoutCoursesInput>
  }

  export type GradeUpsertWithWhereUniqueWithoutCourseInput = {
    where: GradeWhereUniqueInput
    update: XOR<GradeUpdateWithoutCourseInput, GradeUncheckedUpdateWithoutCourseInput>
    create: XOR<GradeCreateWithoutCourseInput, GradeUncheckedCreateWithoutCourseInput>
  }

  export type GradeUpdateWithWhereUniqueWithoutCourseInput = {
    where: GradeWhereUniqueInput
    data: XOR<GradeUpdateWithoutCourseInput, GradeUncheckedUpdateWithoutCourseInput>
  }

  export type GradeUpdateManyWithWhereWithoutCourseInput = {
    where: GradeScalarWhereInput
    data: XOR<GradeUpdateManyMutationInput, GradeUncheckedUpdateManyWithoutCourseInput>
  }

  export type GradeScalarWhereInput = {
    AND?: GradeScalarWhereInput | GradeScalarWhereInput[]
    OR?: GradeScalarWhereInput[]
    NOT?: GradeScalarWhereInput | GradeScalarWhereInput[]
    id?: StringFilter<"Grade"> | string
    gradeACount?: IntFilter<"Grade"> | number
    gradeBCount?: IntFilter<"Grade"> | number
    gradeCCount?: IntFilter<"Grade"> | number
    gradeDCount?: IntFilter<"Grade"> | number
    gradeECount?: IntFilter<"Grade"> | number
    gradeFCount?: IntFilter<"Grade"> | number
    passedCount?: IntFilter<"Grade"> | number
    failedCount?: IntFilter<"Grade"> | number
    courseId?: StringFilter<"Grade"> | string
    semester?: EnumSemesterFilter<"Grade"> | $Enums.Semester
    year?: IntFilter<"Grade"> | number
    createdAt?: DateTimeFilter<"Grade"> | Date | string
    updatedAt?: DateTimeFilter<"Grade"> | Date | string
  }

  export type FacultyUpsertWithoutCoursesInput = {
    update: XOR<FacultyUpdateWithoutCoursesInput, FacultyUncheckedUpdateWithoutCoursesInput>
    create: XOR<FacultyCreateWithoutCoursesInput, FacultyUncheckedCreateWithoutCoursesInput>
    where?: FacultyWhereInput
  }

  export type FacultyUpdateToOneWithWhereWithoutCoursesInput = {
    where?: FacultyWhereInput
    data: XOR<FacultyUpdateWithoutCoursesInput, FacultyUncheckedUpdateWithoutCoursesInput>
  }

  export type FacultyUpdateWithoutCoursesInput = {
    id?: StringFieldUpdateOperationsInput | string
    nameNo?: StringFieldUpdateOperationsInput | string
    nameEn?: StringFieldUpdateOperationsInput | string
    code?: IntFieldUpdateOperationsInput | number
    departments?: DepartmentUpdateManyWithoutFacultyNestedInput
  }

  export type FacultyUncheckedUpdateWithoutCoursesInput = {
    id?: StringFieldUpdateOperationsInput | string
    nameNo?: StringFieldUpdateOperationsInput | string
    nameEn?: StringFieldUpdateOperationsInput | string
    code?: IntFieldUpdateOperationsInput | number
    departments?: DepartmentUncheckedUpdateManyWithoutFacultyNestedInput
  }

  export type DepartmentUpsertWithoutCoursesInput = {
    update: XOR<DepartmentUpdateWithoutCoursesInput, DepartmentUncheckedUpdateWithoutCoursesInput>
    create: XOR<DepartmentCreateWithoutCoursesInput, DepartmentUncheckedCreateWithoutCoursesInput>
    where?: DepartmentWhereInput
  }

  export type DepartmentUpdateToOneWithWhereWithoutCoursesInput = {
    where?: DepartmentWhereInput
    data: XOR<DepartmentUpdateWithoutCoursesInput, DepartmentUncheckedUpdateWithoutCoursesInput>
  }

  export type DepartmentUpdateWithoutCoursesInput = {
    id?: StringFieldUpdateOperationsInput | string
    nameNo?: StringFieldUpdateOperationsInput | string
    nameEn?: StringFieldUpdateOperationsInput | string
    code?: IntFieldUpdateOperationsInput | number
    faculty?: FacultyUpdateOneRequiredWithoutDepartmentsNestedInput
  }

  export type DepartmentUncheckedUpdateWithoutCoursesInput = {
    id?: StringFieldUpdateOperationsInput | string
    nameNo?: StringFieldUpdateOperationsInput | string
    nameEn?: StringFieldUpdateOperationsInput | string
    code?: IntFieldUpdateOperationsInput | number
    facultyId?: StringFieldUpdateOperationsInput | string
  }

  export type CourseCreateWithoutGradesInput = {
    id?: string
    code: string
    nameNo: string
    nameEn?: string | null
    credits?: number | null
    studyLevel: $Enums.StudyLevel
    gradeType: $Enums.GradeType
    firstYearTaught: number
    lastYearTaught?: number | null
    contentNo?: string | null
    contentEn?: string | null
    teachingMethodsNo?: string | null
    teachingMethodsEn?: string | null
    learningOutcomesNo?: string | null
    learningOutcomesEn?: string | null
    examTypeNo?: string | null
    examTypeEn?: string | null
    candidateCount: number
    averageGrade: number
    passRate: number
    createdAt?: Date | string
    updatedAt?: Date | string
    taughtSemesters?: CourseCreatetaughtSemestersInput | $Enums.Semester[]
    teachingLanguages?: CourseCreateteachingLanguagesInput | $Enums.TeachingLanguage[]
    campuses?: CourseCreatecampusesInput | $Enums.Campus[]
    latestYearCheckedForNtnuData?: number | null
    faculty?: FacultyCreateNestedOneWithoutCoursesInput
    department?: DepartmentCreateNestedOneWithoutCoursesInput
  }

  export type CourseUncheckedCreateWithoutGradesInput = {
    id?: string
    code: string
    nameNo: string
    nameEn?: string | null
    credits?: number | null
    studyLevel: $Enums.StudyLevel
    gradeType: $Enums.GradeType
    firstYearTaught: number
    lastYearTaught?: number | null
    contentNo?: string | null
    contentEn?: string | null
    teachingMethodsNo?: string | null
    teachingMethodsEn?: string | null
    learningOutcomesNo?: string | null
    learningOutcomesEn?: string | null
    examTypeNo?: string | null
    examTypeEn?: string | null
    candidateCount: number
    averageGrade: number
    passRate: number
    createdAt?: Date | string
    updatedAt?: Date | string
    taughtSemesters?: CourseCreatetaughtSemestersInput | $Enums.Semester[]
    teachingLanguages?: CourseCreateteachingLanguagesInput | $Enums.TeachingLanguage[]
    campuses?: CourseCreatecampusesInput | $Enums.Campus[]
    facultyId?: string | null
    departmentId?: string | null
    latestYearCheckedForNtnuData?: number | null
  }

  export type CourseCreateOrConnectWithoutGradesInput = {
    where: CourseWhereUniqueInput
    create: XOR<CourseCreateWithoutGradesInput, CourseUncheckedCreateWithoutGradesInput>
  }

  export type CourseUpsertWithoutGradesInput = {
    update: XOR<CourseUpdateWithoutGradesInput, CourseUncheckedUpdateWithoutGradesInput>
    create: XOR<CourseCreateWithoutGradesInput, CourseUncheckedCreateWithoutGradesInput>
    where?: CourseWhereInput
  }

  export type CourseUpdateToOneWithWhereWithoutGradesInput = {
    where?: CourseWhereInput
    data: XOR<CourseUpdateWithoutGradesInput, CourseUncheckedUpdateWithoutGradesInput>
  }

  export type CourseUpdateWithoutGradesInput = {
    id?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    nameNo?: StringFieldUpdateOperationsInput | string
    nameEn?: NullableStringFieldUpdateOperationsInput | string | null
    credits?: NullableFloatFieldUpdateOperationsInput | number | null
    studyLevel?: EnumStudyLevelFieldUpdateOperationsInput | $Enums.StudyLevel
    gradeType?: EnumGradeTypeFieldUpdateOperationsInput | $Enums.GradeType
    firstYearTaught?: IntFieldUpdateOperationsInput | number
    lastYearTaught?: NullableIntFieldUpdateOperationsInput | number | null
    contentNo?: NullableStringFieldUpdateOperationsInput | string | null
    contentEn?: NullableStringFieldUpdateOperationsInput | string | null
    teachingMethodsNo?: NullableStringFieldUpdateOperationsInput | string | null
    teachingMethodsEn?: NullableStringFieldUpdateOperationsInput | string | null
    learningOutcomesNo?: NullableStringFieldUpdateOperationsInput | string | null
    learningOutcomesEn?: NullableStringFieldUpdateOperationsInput | string | null
    examTypeNo?: NullableStringFieldUpdateOperationsInput | string | null
    examTypeEn?: NullableStringFieldUpdateOperationsInput | string | null
    candidateCount?: IntFieldUpdateOperationsInput | number
    averageGrade?: FloatFieldUpdateOperationsInput | number
    passRate?: FloatFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    taughtSemesters?: CourseUpdatetaughtSemestersInput | $Enums.Semester[]
    teachingLanguages?: CourseUpdateteachingLanguagesInput | $Enums.TeachingLanguage[]
    campuses?: CourseUpdatecampusesInput | $Enums.Campus[]
    latestYearCheckedForNtnuData?: NullableIntFieldUpdateOperationsInput | number | null
    faculty?: FacultyUpdateOneWithoutCoursesNestedInput
    department?: DepartmentUpdateOneWithoutCoursesNestedInput
  }

  export type CourseUncheckedUpdateWithoutGradesInput = {
    id?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    nameNo?: StringFieldUpdateOperationsInput | string
    nameEn?: NullableStringFieldUpdateOperationsInput | string | null
    credits?: NullableFloatFieldUpdateOperationsInput | number | null
    studyLevel?: EnumStudyLevelFieldUpdateOperationsInput | $Enums.StudyLevel
    gradeType?: EnumGradeTypeFieldUpdateOperationsInput | $Enums.GradeType
    firstYearTaught?: IntFieldUpdateOperationsInput | number
    lastYearTaught?: NullableIntFieldUpdateOperationsInput | number | null
    contentNo?: NullableStringFieldUpdateOperationsInput | string | null
    contentEn?: NullableStringFieldUpdateOperationsInput | string | null
    teachingMethodsNo?: NullableStringFieldUpdateOperationsInput | string | null
    teachingMethodsEn?: NullableStringFieldUpdateOperationsInput | string | null
    learningOutcomesNo?: NullableStringFieldUpdateOperationsInput | string | null
    learningOutcomesEn?: NullableStringFieldUpdateOperationsInput | string | null
    examTypeNo?: NullableStringFieldUpdateOperationsInput | string | null
    examTypeEn?: NullableStringFieldUpdateOperationsInput | string | null
    candidateCount?: IntFieldUpdateOperationsInput | number
    averageGrade?: FloatFieldUpdateOperationsInput | number
    passRate?: FloatFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    taughtSemesters?: CourseUpdatetaughtSemestersInput | $Enums.Semester[]
    teachingLanguages?: CourseUpdateteachingLanguagesInput | $Enums.TeachingLanguage[]
    campuses?: CourseUpdatecampusesInput | $Enums.Campus[]
    facultyId?: NullableStringFieldUpdateOperationsInput | string | null
    departmentId?: NullableStringFieldUpdateOperationsInput | string | null
    latestYearCheckedForNtnuData?: NullableIntFieldUpdateOperationsInput | number | null
  }

  export type CourseCreateWithoutFacultyInput = {
    id?: string
    code: string
    nameNo: string
    nameEn?: string | null
    credits?: number | null
    studyLevel: $Enums.StudyLevel
    gradeType: $Enums.GradeType
    firstYearTaught: number
    lastYearTaught?: number | null
    contentNo?: string | null
    contentEn?: string | null
    teachingMethodsNo?: string | null
    teachingMethodsEn?: string | null
    learningOutcomesNo?: string | null
    learningOutcomesEn?: string | null
    examTypeNo?: string | null
    examTypeEn?: string | null
    candidateCount: number
    averageGrade: number
    passRate: number
    createdAt?: Date | string
    updatedAt?: Date | string
    taughtSemesters?: CourseCreatetaughtSemestersInput | $Enums.Semester[]
    teachingLanguages?: CourseCreateteachingLanguagesInput | $Enums.TeachingLanguage[]
    campuses?: CourseCreatecampusesInput | $Enums.Campus[]
    latestYearCheckedForNtnuData?: number | null
    grades?: GradeCreateNestedManyWithoutCourseInput
    department?: DepartmentCreateNestedOneWithoutCoursesInput
  }

  export type CourseUncheckedCreateWithoutFacultyInput = {
    id?: string
    code: string
    nameNo: string
    nameEn?: string | null
    credits?: number | null
    studyLevel: $Enums.StudyLevel
    gradeType: $Enums.GradeType
    firstYearTaught: number
    lastYearTaught?: number | null
    contentNo?: string | null
    contentEn?: string | null
    teachingMethodsNo?: string | null
    teachingMethodsEn?: string | null
    learningOutcomesNo?: string | null
    learningOutcomesEn?: string | null
    examTypeNo?: string | null
    examTypeEn?: string | null
    candidateCount: number
    averageGrade: number
    passRate: number
    createdAt?: Date | string
    updatedAt?: Date | string
    taughtSemesters?: CourseCreatetaughtSemestersInput | $Enums.Semester[]
    teachingLanguages?: CourseCreateteachingLanguagesInput | $Enums.TeachingLanguage[]
    campuses?: CourseCreatecampusesInput | $Enums.Campus[]
    departmentId?: string | null
    latestYearCheckedForNtnuData?: number | null
    grades?: GradeUncheckedCreateNestedManyWithoutCourseInput
  }

  export type CourseCreateOrConnectWithoutFacultyInput = {
    where: CourseWhereUniqueInput
    create: XOR<CourseCreateWithoutFacultyInput, CourseUncheckedCreateWithoutFacultyInput>
  }

  export type CourseCreateManyFacultyInputEnvelope = {
    data: CourseCreateManyFacultyInput | CourseCreateManyFacultyInput[]
    skipDuplicates?: boolean
  }

  export type DepartmentCreateWithoutFacultyInput = {
    id?: string
    nameNo: string
    nameEn: string
    code: number
    courses?: CourseCreateNestedManyWithoutDepartmentInput
  }

  export type DepartmentUncheckedCreateWithoutFacultyInput = {
    id?: string
    nameNo: string
    nameEn: string
    code: number
    courses?: CourseUncheckedCreateNestedManyWithoutDepartmentInput
  }

  export type DepartmentCreateOrConnectWithoutFacultyInput = {
    where: DepartmentWhereUniqueInput
    create: XOR<DepartmentCreateWithoutFacultyInput, DepartmentUncheckedCreateWithoutFacultyInput>
  }

  export type DepartmentCreateManyFacultyInputEnvelope = {
    data: DepartmentCreateManyFacultyInput | DepartmentCreateManyFacultyInput[]
    skipDuplicates?: boolean
  }

  export type CourseUpsertWithWhereUniqueWithoutFacultyInput = {
    where: CourseWhereUniqueInput
    update: XOR<CourseUpdateWithoutFacultyInput, CourseUncheckedUpdateWithoutFacultyInput>
    create: XOR<CourseCreateWithoutFacultyInput, CourseUncheckedCreateWithoutFacultyInput>
  }

  export type CourseUpdateWithWhereUniqueWithoutFacultyInput = {
    where: CourseWhereUniqueInput
    data: XOR<CourseUpdateWithoutFacultyInput, CourseUncheckedUpdateWithoutFacultyInput>
  }

  export type CourseUpdateManyWithWhereWithoutFacultyInput = {
    where: CourseScalarWhereInput
    data: XOR<CourseUpdateManyMutationInput, CourseUncheckedUpdateManyWithoutFacultyInput>
  }

  export type CourseScalarWhereInput = {
    AND?: CourseScalarWhereInput | CourseScalarWhereInput[]
    OR?: CourseScalarWhereInput[]
    NOT?: CourseScalarWhereInput | CourseScalarWhereInput[]
    id?: StringFilter<"Course"> | string
    code?: StringFilter<"Course"> | string
    nameNo?: StringFilter<"Course"> | string
    nameEn?: StringNullableFilter<"Course"> | string | null
    credits?: FloatNullableFilter<"Course"> | number | null
    studyLevel?: EnumStudyLevelFilter<"Course"> | $Enums.StudyLevel
    gradeType?: EnumGradeTypeFilter<"Course"> | $Enums.GradeType
    firstYearTaught?: IntFilter<"Course"> | number
    lastYearTaught?: IntNullableFilter<"Course"> | number | null
    contentNo?: StringNullableFilter<"Course"> | string | null
    contentEn?: StringNullableFilter<"Course"> | string | null
    teachingMethodsNo?: StringNullableFilter<"Course"> | string | null
    teachingMethodsEn?: StringNullableFilter<"Course"> | string | null
    learningOutcomesNo?: StringNullableFilter<"Course"> | string | null
    learningOutcomesEn?: StringNullableFilter<"Course"> | string | null
    examTypeNo?: StringNullableFilter<"Course"> | string | null
    examTypeEn?: StringNullableFilter<"Course"> | string | null
    candidateCount?: IntFilter<"Course"> | number
    averageGrade?: FloatFilter<"Course"> | number
    passRate?: FloatFilter<"Course"> | number
    createdAt?: DateTimeFilter<"Course"> | Date | string
    updatedAt?: DateTimeFilter<"Course"> | Date | string
    taughtSemesters?: EnumSemesterNullableListFilter<"Course">
    teachingLanguages?: EnumTeachingLanguageNullableListFilter<"Course">
    campuses?: EnumCampusNullableListFilter<"Course">
    facultyId?: StringNullableFilter<"Course"> | string | null
    departmentId?: StringNullableFilter<"Course"> | string | null
    latestYearCheckedForNtnuData?: IntNullableFilter<"Course"> | number | null
  }

  export type DepartmentUpsertWithWhereUniqueWithoutFacultyInput = {
    where: DepartmentWhereUniqueInput
    update: XOR<DepartmentUpdateWithoutFacultyInput, DepartmentUncheckedUpdateWithoutFacultyInput>
    create: XOR<DepartmentCreateWithoutFacultyInput, DepartmentUncheckedCreateWithoutFacultyInput>
  }

  export type DepartmentUpdateWithWhereUniqueWithoutFacultyInput = {
    where: DepartmentWhereUniqueInput
    data: XOR<DepartmentUpdateWithoutFacultyInput, DepartmentUncheckedUpdateWithoutFacultyInput>
  }

  export type DepartmentUpdateManyWithWhereWithoutFacultyInput = {
    where: DepartmentScalarWhereInput
    data: XOR<DepartmentUpdateManyMutationInput, DepartmentUncheckedUpdateManyWithoutFacultyInput>
  }

  export type DepartmentScalarWhereInput = {
    AND?: DepartmentScalarWhereInput | DepartmentScalarWhereInput[]
    OR?: DepartmentScalarWhereInput[]
    NOT?: DepartmentScalarWhereInput | DepartmentScalarWhereInput[]
    id?: StringFilter<"Department"> | string
    nameNo?: StringFilter<"Department"> | string
    nameEn?: StringFilter<"Department"> | string
    code?: IntFilter<"Department"> | number
    facultyId?: StringFilter<"Department"> | string
  }

  export type CourseCreateWithoutDepartmentInput = {
    id?: string
    code: string
    nameNo: string
    nameEn?: string | null
    credits?: number | null
    studyLevel: $Enums.StudyLevel
    gradeType: $Enums.GradeType
    firstYearTaught: number
    lastYearTaught?: number | null
    contentNo?: string | null
    contentEn?: string | null
    teachingMethodsNo?: string | null
    teachingMethodsEn?: string | null
    learningOutcomesNo?: string | null
    learningOutcomesEn?: string | null
    examTypeNo?: string | null
    examTypeEn?: string | null
    candidateCount: number
    averageGrade: number
    passRate: number
    createdAt?: Date | string
    updatedAt?: Date | string
    taughtSemesters?: CourseCreatetaughtSemestersInput | $Enums.Semester[]
    teachingLanguages?: CourseCreateteachingLanguagesInput | $Enums.TeachingLanguage[]
    campuses?: CourseCreatecampusesInput | $Enums.Campus[]
    latestYearCheckedForNtnuData?: number | null
    grades?: GradeCreateNestedManyWithoutCourseInput
    faculty?: FacultyCreateNestedOneWithoutCoursesInput
  }

  export type CourseUncheckedCreateWithoutDepartmentInput = {
    id?: string
    code: string
    nameNo: string
    nameEn?: string | null
    credits?: number | null
    studyLevel: $Enums.StudyLevel
    gradeType: $Enums.GradeType
    firstYearTaught: number
    lastYearTaught?: number | null
    contentNo?: string | null
    contentEn?: string | null
    teachingMethodsNo?: string | null
    teachingMethodsEn?: string | null
    learningOutcomesNo?: string | null
    learningOutcomesEn?: string | null
    examTypeNo?: string | null
    examTypeEn?: string | null
    candidateCount: number
    averageGrade: number
    passRate: number
    createdAt?: Date | string
    updatedAt?: Date | string
    taughtSemesters?: CourseCreatetaughtSemestersInput | $Enums.Semester[]
    teachingLanguages?: CourseCreateteachingLanguagesInput | $Enums.TeachingLanguage[]
    campuses?: CourseCreatecampusesInput | $Enums.Campus[]
    facultyId?: string | null
    latestYearCheckedForNtnuData?: number | null
    grades?: GradeUncheckedCreateNestedManyWithoutCourseInput
  }

  export type CourseCreateOrConnectWithoutDepartmentInput = {
    where: CourseWhereUniqueInput
    create: XOR<CourseCreateWithoutDepartmentInput, CourseUncheckedCreateWithoutDepartmentInput>
  }

  export type CourseCreateManyDepartmentInputEnvelope = {
    data: CourseCreateManyDepartmentInput | CourseCreateManyDepartmentInput[]
    skipDuplicates?: boolean
  }

  export type FacultyCreateWithoutDepartmentsInput = {
    id?: string
    nameNo: string
    nameEn: string
    code: number
    courses?: CourseCreateNestedManyWithoutFacultyInput
  }

  export type FacultyUncheckedCreateWithoutDepartmentsInput = {
    id?: string
    nameNo: string
    nameEn: string
    code: number
    courses?: CourseUncheckedCreateNestedManyWithoutFacultyInput
  }

  export type FacultyCreateOrConnectWithoutDepartmentsInput = {
    where: FacultyWhereUniqueInput
    create: XOR<FacultyCreateWithoutDepartmentsInput, FacultyUncheckedCreateWithoutDepartmentsInput>
  }

  export type CourseUpsertWithWhereUniqueWithoutDepartmentInput = {
    where: CourseWhereUniqueInput
    update: XOR<CourseUpdateWithoutDepartmentInput, CourseUncheckedUpdateWithoutDepartmentInput>
    create: XOR<CourseCreateWithoutDepartmentInput, CourseUncheckedCreateWithoutDepartmentInput>
  }

  export type CourseUpdateWithWhereUniqueWithoutDepartmentInput = {
    where: CourseWhereUniqueInput
    data: XOR<CourseUpdateWithoutDepartmentInput, CourseUncheckedUpdateWithoutDepartmentInput>
  }

  export type CourseUpdateManyWithWhereWithoutDepartmentInput = {
    where: CourseScalarWhereInput
    data: XOR<CourseUpdateManyMutationInput, CourseUncheckedUpdateManyWithoutDepartmentInput>
  }

  export type FacultyUpsertWithoutDepartmentsInput = {
    update: XOR<FacultyUpdateWithoutDepartmentsInput, FacultyUncheckedUpdateWithoutDepartmentsInput>
    create: XOR<FacultyCreateWithoutDepartmentsInput, FacultyUncheckedCreateWithoutDepartmentsInput>
    where?: FacultyWhereInput
  }

  export type FacultyUpdateToOneWithWhereWithoutDepartmentsInput = {
    where?: FacultyWhereInput
    data: XOR<FacultyUpdateWithoutDepartmentsInput, FacultyUncheckedUpdateWithoutDepartmentsInput>
  }

  export type FacultyUpdateWithoutDepartmentsInput = {
    id?: StringFieldUpdateOperationsInput | string
    nameNo?: StringFieldUpdateOperationsInput | string
    nameEn?: StringFieldUpdateOperationsInput | string
    code?: IntFieldUpdateOperationsInput | number
    courses?: CourseUpdateManyWithoutFacultyNestedInput
  }

  export type FacultyUncheckedUpdateWithoutDepartmentsInput = {
    id?: StringFieldUpdateOperationsInput | string
    nameNo?: StringFieldUpdateOperationsInput | string
    nameEn?: StringFieldUpdateOperationsInput | string
    code?: IntFieldUpdateOperationsInput | number
    courses?: CourseUncheckedUpdateManyWithoutFacultyNestedInput
  }

  export type GradeCreateManyCourseInput = {
    id?: string
    gradeACount: number
    gradeBCount: number
    gradeCCount: number
    gradeDCount: number
    gradeECount: number
    gradeFCount: number
    passedCount: number
    failedCount: number
    semester: $Enums.Semester
    year: number
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type GradeUpdateWithoutCourseInput = {
    id?: StringFieldUpdateOperationsInput | string
    gradeACount?: IntFieldUpdateOperationsInput | number
    gradeBCount?: IntFieldUpdateOperationsInput | number
    gradeCCount?: IntFieldUpdateOperationsInput | number
    gradeDCount?: IntFieldUpdateOperationsInput | number
    gradeECount?: IntFieldUpdateOperationsInput | number
    gradeFCount?: IntFieldUpdateOperationsInput | number
    passedCount?: IntFieldUpdateOperationsInput | number
    failedCount?: IntFieldUpdateOperationsInput | number
    semester?: EnumSemesterFieldUpdateOperationsInput | $Enums.Semester
    year?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type GradeUncheckedUpdateWithoutCourseInput = {
    id?: StringFieldUpdateOperationsInput | string
    gradeACount?: IntFieldUpdateOperationsInput | number
    gradeBCount?: IntFieldUpdateOperationsInput | number
    gradeCCount?: IntFieldUpdateOperationsInput | number
    gradeDCount?: IntFieldUpdateOperationsInput | number
    gradeECount?: IntFieldUpdateOperationsInput | number
    gradeFCount?: IntFieldUpdateOperationsInput | number
    passedCount?: IntFieldUpdateOperationsInput | number
    failedCount?: IntFieldUpdateOperationsInput | number
    semester?: EnumSemesterFieldUpdateOperationsInput | $Enums.Semester
    year?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type GradeUncheckedUpdateManyWithoutCourseInput = {
    id?: StringFieldUpdateOperationsInput | string
    gradeACount?: IntFieldUpdateOperationsInput | number
    gradeBCount?: IntFieldUpdateOperationsInput | number
    gradeCCount?: IntFieldUpdateOperationsInput | number
    gradeDCount?: IntFieldUpdateOperationsInput | number
    gradeECount?: IntFieldUpdateOperationsInput | number
    gradeFCount?: IntFieldUpdateOperationsInput | number
    passedCount?: IntFieldUpdateOperationsInput | number
    failedCount?: IntFieldUpdateOperationsInput | number
    semester?: EnumSemesterFieldUpdateOperationsInput | $Enums.Semester
    year?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CourseCreateManyFacultyInput = {
    id?: string
    code: string
    nameNo: string
    nameEn?: string | null
    credits?: number | null
    studyLevel: $Enums.StudyLevel
    gradeType: $Enums.GradeType
    firstYearTaught: number
    lastYearTaught?: number | null
    contentNo?: string | null
    contentEn?: string | null
    teachingMethodsNo?: string | null
    teachingMethodsEn?: string | null
    learningOutcomesNo?: string | null
    learningOutcomesEn?: string | null
    examTypeNo?: string | null
    examTypeEn?: string | null
    candidateCount: number
    averageGrade: number
    passRate: number
    createdAt?: Date | string
    updatedAt?: Date | string
    taughtSemesters?: CourseCreatetaughtSemestersInput | $Enums.Semester[]
    teachingLanguages?: CourseCreateteachingLanguagesInput | $Enums.TeachingLanguage[]
    campuses?: CourseCreatecampusesInput | $Enums.Campus[]
    departmentId?: string | null
    latestYearCheckedForNtnuData?: number | null
  }

  export type DepartmentCreateManyFacultyInput = {
    id?: string
    nameNo: string
    nameEn: string
    code: number
  }

  export type CourseUpdateWithoutFacultyInput = {
    id?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    nameNo?: StringFieldUpdateOperationsInput | string
    nameEn?: NullableStringFieldUpdateOperationsInput | string | null
    credits?: NullableFloatFieldUpdateOperationsInput | number | null
    studyLevel?: EnumStudyLevelFieldUpdateOperationsInput | $Enums.StudyLevel
    gradeType?: EnumGradeTypeFieldUpdateOperationsInput | $Enums.GradeType
    firstYearTaught?: IntFieldUpdateOperationsInput | number
    lastYearTaught?: NullableIntFieldUpdateOperationsInput | number | null
    contentNo?: NullableStringFieldUpdateOperationsInput | string | null
    contentEn?: NullableStringFieldUpdateOperationsInput | string | null
    teachingMethodsNo?: NullableStringFieldUpdateOperationsInput | string | null
    teachingMethodsEn?: NullableStringFieldUpdateOperationsInput | string | null
    learningOutcomesNo?: NullableStringFieldUpdateOperationsInput | string | null
    learningOutcomesEn?: NullableStringFieldUpdateOperationsInput | string | null
    examTypeNo?: NullableStringFieldUpdateOperationsInput | string | null
    examTypeEn?: NullableStringFieldUpdateOperationsInput | string | null
    candidateCount?: IntFieldUpdateOperationsInput | number
    averageGrade?: FloatFieldUpdateOperationsInput | number
    passRate?: FloatFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    taughtSemesters?: CourseUpdatetaughtSemestersInput | $Enums.Semester[]
    teachingLanguages?: CourseUpdateteachingLanguagesInput | $Enums.TeachingLanguage[]
    campuses?: CourseUpdatecampusesInput | $Enums.Campus[]
    latestYearCheckedForNtnuData?: NullableIntFieldUpdateOperationsInput | number | null
    grades?: GradeUpdateManyWithoutCourseNestedInput
    department?: DepartmentUpdateOneWithoutCoursesNestedInput
  }

  export type CourseUncheckedUpdateWithoutFacultyInput = {
    id?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    nameNo?: StringFieldUpdateOperationsInput | string
    nameEn?: NullableStringFieldUpdateOperationsInput | string | null
    credits?: NullableFloatFieldUpdateOperationsInput | number | null
    studyLevel?: EnumStudyLevelFieldUpdateOperationsInput | $Enums.StudyLevel
    gradeType?: EnumGradeTypeFieldUpdateOperationsInput | $Enums.GradeType
    firstYearTaught?: IntFieldUpdateOperationsInput | number
    lastYearTaught?: NullableIntFieldUpdateOperationsInput | number | null
    contentNo?: NullableStringFieldUpdateOperationsInput | string | null
    contentEn?: NullableStringFieldUpdateOperationsInput | string | null
    teachingMethodsNo?: NullableStringFieldUpdateOperationsInput | string | null
    teachingMethodsEn?: NullableStringFieldUpdateOperationsInput | string | null
    learningOutcomesNo?: NullableStringFieldUpdateOperationsInput | string | null
    learningOutcomesEn?: NullableStringFieldUpdateOperationsInput | string | null
    examTypeNo?: NullableStringFieldUpdateOperationsInput | string | null
    examTypeEn?: NullableStringFieldUpdateOperationsInput | string | null
    candidateCount?: IntFieldUpdateOperationsInput | number
    averageGrade?: FloatFieldUpdateOperationsInput | number
    passRate?: FloatFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    taughtSemesters?: CourseUpdatetaughtSemestersInput | $Enums.Semester[]
    teachingLanguages?: CourseUpdateteachingLanguagesInput | $Enums.TeachingLanguage[]
    campuses?: CourseUpdatecampusesInput | $Enums.Campus[]
    departmentId?: NullableStringFieldUpdateOperationsInput | string | null
    latestYearCheckedForNtnuData?: NullableIntFieldUpdateOperationsInput | number | null
    grades?: GradeUncheckedUpdateManyWithoutCourseNestedInput
  }

  export type CourseUncheckedUpdateManyWithoutFacultyInput = {
    id?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    nameNo?: StringFieldUpdateOperationsInput | string
    nameEn?: NullableStringFieldUpdateOperationsInput | string | null
    credits?: NullableFloatFieldUpdateOperationsInput | number | null
    studyLevel?: EnumStudyLevelFieldUpdateOperationsInput | $Enums.StudyLevel
    gradeType?: EnumGradeTypeFieldUpdateOperationsInput | $Enums.GradeType
    firstYearTaught?: IntFieldUpdateOperationsInput | number
    lastYearTaught?: NullableIntFieldUpdateOperationsInput | number | null
    contentNo?: NullableStringFieldUpdateOperationsInput | string | null
    contentEn?: NullableStringFieldUpdateOperationsInput | string | null
    teachingMethodsNo?: NullableStringFieldUpdateOperationsInput | string | null
    teachingMethodsEn?: NullableStringFieldUpdateOperationsInput | string | null
    learningOutcomesNo?: NullableStringFieldUpdateOperationsInput | string | null
    learningOutcomesEn?: NullableStringFieldUpdateOperationsInput | string | null
    examTypeNo?: NullableStringFieldUpdateOperationsInput | string | null
    examTypeEn?: NullableStringFieldUpdateOperationsInput | string | null
    candidateCount?: IntFieldUpdateOperationsInput | number
    averageGrade?: FloatFieldUpdateOperationsInput | number
    passRate?: FloatFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    taughtSemesters?: CourseUpdatetaughtSemestersInput | $Enums.Semester[]
    teachingLanguages?: CourseUpdateteachingLanguagesInput | $Enums.TeachingLanguage[]
    campuses?: CourseUpdatecampusesInput | $Enums.Campus[]
    departmentId?: NullableStringFieldUpdateOperationsInput | string | null
    latestYearCheckedForNtnuData?: NullableIntFieldUpdateOperationsInput | number | null
  }

  export type DepartmentUpdateWithoutFacultyInput = {
    id?: StringFieldUpdateOperationsInput | string
    nameNo?: StringFieldUpdateOperationsInput | string
    nameEn?: StringFieldUpdateOperationsInput | string
    code?: IntFieldUpdateOperationsInput | number
    courses?: CourseUpdateManyWithoutDepartmentNestedInput
  }

  export type DepartmentUncheckedUpdateWithoutFacultyInput = {
    id?: StringFieldUpdateOperationsInput | string
    nameNo?: StringFieldUpdateOperationsInput | string
    nameEn?: StringFieldUpdateOperationsInput | string
    code?: IntFieldUpdateOperationsInput | number
    courses?: CourseUncheckedUpdateManyWithoutDepartmentNestedInput
  }

  export type DepartmentUncheckedUpdateManyWithoutFacultyInput = {
    id?: StringFieldUpdateOperationsInput | string
    nameNo?: StringFieldUpdateOperationsInput | string
    nameEn?: StringFieldUpdateOperationsInput | string
    code?: IntFieldUpdateOperationsInput | number
  }

  export type CourseCreateManyDepartmentInput = {
    id?: string
    code: string
    nameNo: string
    nameEn?: string | null
    credits?: number | null
    studyLevel: $Enums.StudyLevel
    gradeType: $Enums.GradeType
    firstYearTaught: number
    lastYearTaught?: number | null
    contentNo?: string | null
    contentEn?: string | null
    teachingMethodsNo?: string | null
    teachingMethodsEn?: string | null
    learningOutcomesNo?: string | null
    learningOutcomesEn?: string | null
    examTypeNo?: string | null
    examTypeEn?: string | null
    candidateCount: number
    averageGrade: number
    passRate: number
    createdAt?: Date | string
    updatedAt?: Date | string
    taughtSemesters?: CourseCreatetaughtSemestersInput | $Enums.Semester[]
    teachingLanguages?: CourseCreateteachingLanguagesInput | $Enums.TeachingLanguage[]
    campuses?: CourseCreatecampusesInput | $Enums.Campus[]
    facultyId?: string | null
    latestYearCheckedForNtnuData?: number | null
  }

  export type CourseUpdateWithoutDepartmentInput = {
    id?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    nameNo?: StringFieldUpdateOperationsInput | string
    nameEn?: NullableStringFieldUpdateOperationsInput | string | null
    credits?: NullableFloatFieldUpdateOperationsInput | number | null
    studyLevel?: EnumStudyLevelFieldUpdateOperationsInput | $Enums.StudyLevel
    gradeType?: EnumGradeTypeFieldUpdateOperationsInput | $Enums.GradeType
    firstYearTaught?: IntFieldUpdateOperationsInput | number
    lastYearTaught?: NullableIntFieldUpdateOperationsInput | number | null
    contentNo?: NullableStringFieldUpdateOperationsInput | string | null
    contentEn?: NullableStringFieldUpdateOperationsInput | string | null
    teachingMethodsNo?: NullableStringFieldUpdateOperationsInput | string | null
    teachingMethodsEn?: NullableStringFieldUpdateOperationsInput | string | null
    learningOutcomesNo?: NullableStringFieldUpdateOperationsInput | string | null
    learningOutcomesEn?: NullableStringFieldUpdateOperationsInput | string | null
    examTypeNo?: NullableStringFieldUpdateOperationsInput | string | null
    examTypeEn?: NullableStringFieldUpdateOperationsInput | string | null
    candidateCount?: IntFieldUpdateOperationsInput | number
    averageGrade?: FloatFieldUpdateOperationsInput | number
    passRate?: FloatFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    taughtSemesters?: CourseUpdatetaughtSemestersInput | $Enums.Semester[]
    teachingLanguages?: CourseUpdateteachingLanguagesInput | $Enums.TeachingLanguage[]
    campuses?: CourseUpdatecampusesInput | $Enums.Campus[]
    latestYearCheckedForNtnuData?: NullableIntFieldUpdateOperationsInput | number | null
    grades?: GradeUpdateManyWithoutCourseNestedInput
    faculty?: FacultyUpdateOneWithoutCoursesNestedInput
  }

  export type CourseUncheckedUpdateWithoutDepartmentInput = {
    id?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    nameNo?: StringFieldUpdateOperationsInput | string
    nameEn?: NullableStringFieldUpdateOperationsInput | string | null
    credits?: NullableFloatFieldUpdateOperationsInput | number | null
    studyLevel?: EnumStudyLevelFieldUpdateOperationsInput | $Enums.StudyLevel
    gradeType?: EnumGradeTypeFieldUpdateOperationsInput | $Enums.GradeType
    firstYearTaught?: IntFieldUpdateOperationsInput | number
    lastYearTaught?: NullableIntFieldUpdateOperationsInput | number | null
    contentNo?: NullableStringFieldUpdateOperationsInput | string | null
    contentEn?: NullableStringFieldUpdateOperationsInput | string | null
    teachingMethodsNo?: NullableStringFieldUpdateOperationsInput | string | null
    teachingMethodsEn?: NullableStringFieldUpdateOperationsInput | string | null
    learningOutcomesNo?: NullableStringFieldUpdateOperationsInput | string | null
    learningOutcomesEn?: NullableStringFieldUpdateOperationsInput | string | null
    examTypeNo?: NullableStringFieldUpdateOperationsInput | string | null
    examTypeEn?: NullableStringFieldUpdateOperationsInput | string | null
    candidateCount?: IntFieldUpdateOperationsInput | number
    averageGrade?: FloatFieldUpdateOperationsInput | number
    passRate?: FloatFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    taughtSemesters?: CourseUpdatetaughtSemestersInput | $Enums.Semester[]
    teachingLanguages?: CourseUpdateteachingLanguagesInput | $Enums.TeachingLanguage[]
    campuses?: CourseUpdatecampusesInput | $Enums.Campus[]
    facultyId?: NullableStringFieldUpdateOperationsInput | string | null
    latestYearCheckedForNtnuData?: NullableIntFieldUpdateOperationsInput | number | null
    grades?: GradeUncheckedUpdateManyWithoutCourseNestedInput
  }

  export type CourseUncheckedUpdateManyWithoutDepartmentInput = {
    id?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    nameNo?: StringFieldUpdateOperationsInput | string
    nameEn?: NullableStringFieldUpdateOperationsInput | string | null
    credits?: NullableFloatFieldUpdateOperationsInput | number | null
    studyLevel?: EnumStudyLevelFieldUpdateOperationsInput | $Enums.StudyLevel
    gradeType?: EnumGradeTypeFieldUpdateOperationsInput | $Enums.GradeType
    firstYearTaught?: IntFieldUpdateOperationsInput | number
    lastYearTaught?: NullableIntFieldUpdateOperationsInput | number | null
    contentNo?: NullableStringFieldUpdateOperationsInput | string | null
    contentEn?: NullableStringFieldUpdateOperationsInput | string | null
    teachingMethodsNo?: NullableStringFieldUpdateOperationsInput | string | null
    teachingMethodsEn?: NullableStringFieldUpdateOperationsInput | string | null
    learningOutcomesNo?: NullableStringFieldUpdateOperationsInput | string | null
    learningOutcomesEn?: NullableStringFieldUpdateOperationsInput | string | null
    examTypeNo?: NullableStringFieldUpdateOperationsInput | string | null
    examTypeEn?: NullableStringFieldUpdateOperationsInput | string | null
    candidateCount?: IntFieldUpdateOperationsInput | number
    averageGrade?: FloatFieldUpdateOperationsInput | number
    passRate?: FloatFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    taughtSemesters?: CourseUpdatetaughtSemestersInput | $Enums.Semester[]
    teachingLanguages?: CourseUpdateteachingLanguagesInput | $Enums.TeachingLanguage[]
    campuses?: CourseUpdatecampusesInput | $Enums.Campus[]
    facultyId?: NullableStringFieldUpdateOperationsInput | string | null
    latestYearCheckedForNtnuData?: NullableIntFieldUpdateOperationsInput | number | null
  }



  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}