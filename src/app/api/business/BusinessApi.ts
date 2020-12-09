import firebase from 'firebase/app';
import { WithId, Category, Product, Business, BankAccount } from 'appjusto-types';
import { documentAs, documentsAs } from '../utils';
import { MenuConfig } from 'appjusto-types/menu';
import FilesApi from '../FilesApi';

export default class MenuApi {
  constructor(
    private firestore: firebase.firestore.Firestore,
    private functions: firebase.functions.Functions,
    private files: FilesApi
  ) {}

  // private helpers
  // firestora paths
  private getBusinessRef(businessId: string) {
    return this.firestore.collection('business').doc(businessId);
  }
  private getCategoriesRef(businessId: string) {
    return this.getBusinessRef(businessId).collection('categories');
  }
  private getCategoryRef(businessId: string, categoryId: string) {
    return this.getCategoriesRef(businessId).doc(categoryId);
  }
  private getProductsRef(businessId: string) {
    return this.getBusinessRef(businessId).collection('products');
  }
  private getProductRef(businessId: string, productId: string) {
    return this.getProductsRef(businessId).doc(productId);
  }
  private getMenuConfigRef(businessId: string) {
    return this.getBusinessRef(businessId).collection('config').doc('menu');
  }
  private getBankAccountRef(businessId: string) {
    return this.getBusinessRef(businessId).collection('private').doc('bank')
  }
  // storage path
  private getBusinessStoragePath(businessId: string) {
    return `business/${businessId}`;
  }
  private getBusinessLogoUploadStoragePath(businessId: string) {
    return `business/${businessId}/logo.jpg`;
  }
  private getBusinessLogoStoragePath(businessId: string) {
    return `business/${businessId}/logo_1024x1024.jpg`;
  }
  private getBusinessCoverUploadStoragePath(businessId: string) {
    return `business/${businessId}/cover.jpg`;
  }
  private getBusinessCoverStoragePath(businessId: string) {
    return `business/${businessId}/cover_1024x1024.jpg`;
  }
  private getProductsStoragePath(businessId: string) {
    return `${this.getBusinessStoragePath(businessId)}/products`;
  }
  private getProductUploadStoragePath(businessId: string, productId: string) {
    return `${this.getProductsStoragePath(businessId)}/${productId}.jpg`;
  }
  private getProductImageStoragePath(businessId: string, productId: string) {
    return `${this.getProductsStoragePath(businessId)}/${productId}_1024x1024.jpg`;
  }

  // public
  // business profile
  observeBusinessProfile(
    businessId: string,
    resultHandler: (business: WithId<Business>) => void
  ): firebase.Unsubscribe {
    const unsubscribe = this.getBusinessRef(businessId).onSnapshot(
      (doc) => {
        resultHandler({ ...(doc.data() as Business), id: businessId });
      },
      (error) => {
        console.error(error);
      }
    );
    return unsubscribe;
  }

  async updateBusinessProfile(businessId: string, changes: Partial<Business>) {
    await this.getBusinessRef(businessId).set(changes, { merge: true });
  }

  // bank account
  async fetchBankAccount(businessId: string) {
    const doc = await this.getBankAccountRef(businessId).get();
    return documentAs<BankAccount>(doc);
  }

  async updateBankAccount(businessId: string, changes: Partial<BankAccount>) {
    await this.getBankAccountRef(businessId).set(changes, { merge: true });
  }

  // logo
  uploadBusinessLogo(
    businessId: string,
    file: File,
    progressHandler?: (progress: number) => void
  ) {
    return this.files.upload(
      file,
      this.getBusinessLogoUploadStoragePath(businessId),
      progressHandler
    );
  }
  getBusinessLogoURL(businessId: string) {
    return this.files.getDownloadURL(this.getBusinessLogoStoragePath(businessId));
  }

  // cover image
  uploadBusinessCover(
    businessId: string,
    file: File,
    progressHandler?: (progress: number) => void
  ) {
    return this.files.upload(
      file,
      this.getBusinessCoverUploadStoragePath(businessId),
      progressHandler
    );
  }
  getBusinessCoverURL(businessId: string) {
    return this.files.getDownloadURL(this.getBusinessCoverStoragePath(businessId));
  }

  // menu config
  observeMenuConfig(
    businessId: string,
    resultHandler: (menuConfig: MenuConfig) => void
  ): firebase.Unsubscribe {
    const unsubscribe = this.getMenuConfigRef(businessId).onSnapshot(
      (doc) => {
        resultHandler({ ...(doc.data() as MenuConfig) });
      },
      (error) => {
        console.error(error);
      }
    );
    return unsubscribe;
  }

  async updateMenuConfig(businessId: string, menuConfig: MenuConfig) {
    await this.getMenuConfigRef(businessId).set(menuConfig, { merge: true });
  }

  // categories
  observeCategories(
    businessId: string,
    resultHandler: (categories: WithId<Category>[]) => void
  ): firebase.Unsubscribe {
    const unsubscribe = this.getCategoriesRef(businessId).onSnapshot(
      (querySnapshot) => {
        resultHandler(documentsAs<Category>(querySnapshot.docs));
      },
      (error) => {
        console.error(error);
      }
    );
    return unsubscribe;
  }

  createCategoryRef(businessId: string): string {
    return this.getCategoriesRef(businessId).doc().id;
  }

  async fetchCategory(businessId: string, categoryId: string) {
    const doc = await this.getCategoryRef(businessId, categoryId).get();
    return documentAs<Category>(doc);
  }

  async createCategory(businessId: string, categoryId: string, category: Category) {
    const timestamp = firebase.firestore.FieldValue.serverTimestamp();
    await this.getCategoryRef(businessId, categoryId).set({
      ...category,
      createdOn: timestamp,
      updatedOn: timestamp,
    } as Category);
  }

  async updateCategory(businessId: string, categoryId: string, changes: Partial<Category>) {
    const timestamp = firebase.firestore.FieldValue.serverTimestamp();
    await this.getCategoryRef(businessId, categoryId).update({
      ...changes,
      updatedOn: timestamp,
    } as Partial<Category>);
  }

  // products
  observeProducts(
    businessId: string,
    resultHandler: (products: WithId<Product>[]) => void
  ): firebase.Unsubscribe {
    const query = this.getProductsRef(businessId);
    const unsubscribe = query.onSnapshot(
      (querySnapshot) => {
        resultHandler(documentsAs<Product>(querySnapshot.docs));
      },
      (error) => {
        console.error(error);
      }
    );
    return unsubscribe;
  }

  createProductRef(businessId: string): string {
    return this.getProductsRef(businessId).doc().id;
  }

  async fetchProduct(businessId: string, productId: string) {
    const doc = await this.getProductRef(businessId, productId).get();
    return documentAs<Product>(doc);
  }

  async createProduct(businessId: string, productId: string, product: Product) {
    // creating product
    const timestamp = firebase.firestore.FieldValue.serverTimestamp();
    await this.getProductRef(businessId, productId).set({
      ...product,
      createdOn: timestamp,
      updatedOn: timestamp,
    } as Product);
  }

  async updateProduct(businessId: string, productId: string, changes: Partial<Product>) {
    const timestamp = firebase.firestore.FieldValue.serverTimestamp();
    await this.getProductRef(businessId, productId).update({
      ...changes,
      updatedOn: timestamp,
    } as Partial<Product>);
  }

  uploadProductPhoto(
    businessId: string,
    productId: string,
    file: File,
    progressHandler?: (progress: number) => void
  ) {
    return this.files.upload(
      file,
      this.getProductUploadStoragePath(businessId, productId),
      progressHandler
    );
  }

  getProductImageURL(businessId: string, productId: string) {
    return this.files.getDownloadURL(this.getProductImageStoragePath(businessId, productId));
  }
}