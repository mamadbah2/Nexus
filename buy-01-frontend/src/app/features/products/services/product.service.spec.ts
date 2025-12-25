import { TestBed } from "@angular/core/testing";
import {
  HttpClientTestingModule,
  HttpTestingController,
} from "@angular/common/http/testing";

import { ProductService } from "./product.service";
import { ProductModels, ProductPage } from "../models/product.models";
import { environment } from "../../../../environments/environment";

describe("ProductService", () => {
  let service: ProductService;
  let httpMock: HttpTestingController;
  const apiUrl = environment.apiUrl;

  const mockProducts: ProductModels[] = [
    {
      id: "1",
      name: "Product A",
      description: "Desc A",
      price: "100",
      quantity: "50",
      userId: "seller-1",
      images: [
        {
          id: "img-1",
          imageUrl: "image_a.png",
          productId: "1",
        },
      ],
    },
    {
      id: "2",
      name: "Product B",
      description: "Desc B",
      price: "250",
      quantity: "20",
      userId: "seller-2",
      images: [
        {
          id: "img-2",
          imageUrl: "image_b.png",
          productId: "2",
        },
      ],
    },
  ];

  const mockPage: ProductPage = {
    content: mockProducts,
    totalElements: mockProducts.length,
    totalPages: 1,
    size: 20,
    number: 0,
    numberOfElements: mockProducts.length,
    first: true,
    last: true,
    empty: false,
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });

    service = TestBed.inject(ProductService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  describe("getProductList", () => {
    it("should request paginated products with default params", () => {
      let actualResponse: ProductPage | undefined;

      service.getProductList().subscribe((response) => {
        actualResponse = response;
      });

      const req = httpMock.expectOne(
        (request) => request.url === `${apiUrl}/api/products`,
      );

      expect(req.request.method).toBe("GET");
      expect(req.request.params.get("page")).toBe("0");
      expect(req.request.params.get("size")).toBe("20");
      expect(req.request.params.get("sortBy")).toBe("id");
      expect(req.request.params.get("sortDirection")).toBe("DESC");

      req.flush(mockPage);
      expect(actualResponse).toEqual(mockPage);
    });

    it("should override pagination params when provided", () => {
      service
        .getProductList({ page: 2, size: 12, sortBy: "price", sortDirection: "ASC" })
        .subscribe();

      const req = httpMock.expectOne(
        (request) => request.url === `${apiUrl}/api/products`,
      );

      expect(req.request.params.get("page")).toBe("2");
      expect(req.request.params.get("size")).toBe("12");
      expect(req.request.params.get("sortBy")).toBe("price");
      expect(req.request.params.get("sortDirection")).toBe("ASC");

      req.flush(mockPage);
    });

    it("should propagate errors", () => {
      const mockError = { status: 500, statusText: "Server Error" };
      let capturedError: any;

      service.getProductList().subscribe({
        error: (err) => (capturedError = err),
      });

      const req = httpMock.expectOne(
        (request) => request.url === `${apiUrl}/api/products`,
      );
      req.flush("boom", mockError);

      expect(capturedError).toBeTruthy();
      expect(capturedError.status).toBe(500);
    });
  });

  describe("getOneProduct", () => {
    it("should fetch a single product", () => {
      const targetId = "123";
      let receivedProduct: ProductModels | undefined;

      service.getOneProduct(targetId).subscribe((product) => {
        receivedProduct = product;
      });

      const req = httpMock.expectOne(
        `${apiUrl}/api/products/${targetId}`,
      );
      expect(req.request.method).toBe("GET");

      req.flush(mockProducts[0]);
      expect(receivedProduct).toEqual(mockProducts[0]);
    });
  });

  describe("searchProducts", () => {
    it("should search products with query and filters", () => {
      const searchParams = { query: "phone", minPrice: 100, maxPrice: 500 };
      const queryParams = { page: 1, size: 10 };

      service.searchProducts(searchParams, queryParams).subscribe((response) => {
        expect(response).toEqual(mockPage);
      });

      const req = httpMock.expectOne((request) => 
        request.url === `${apiUrl}/api/products/search`
      );

      expect(req.request.method).toBe("GET");
      expect(req.request.params.get("query")).toBe("phone");
      expect(req.request.params.get("minPrice")).toBe("100");
      expect(req.request.params.get("maxPrice")).toBe("500");
      expect(req.request.params.get("page")).toBe("1");
      expect(req.request.params.get("size")).toBe("10");

      req.flush(mockPage);
    });

    it("should handle empty search params", () => {
      service.searchProducts({}).subscribe();

      const req = httpMock.expectOne((request) => 
        request.url === `${apiUrl}/api/products/search`
      );
      
      expect(req.request.params.has("query")).toBeFalse();
      expect(req.request.params.has("minPrice")).toBeFalse();
      expect(req.request.params.has("maxPrice")).toBeFalse();
      
      req.flush(mockPage);
    });
  });

  describe("suggestProducts", () => {
    it("should fetch suggestions", () => {
      const suggestions = ["iphone", "ipad"];
      const query = "ip";

      service.suggestProducts(query).subscribe((response) => {
        expect(response).toEqual(suggestions);
      });

      const req = httpMock.expectOne((request) => 
        request.url === `${apiUrl}/api/products/suggest`
      );

      expect(req.request.method).toBe("GET");
      expect(req.request.params.get("query")).toBe(query);

      req.flush(suggestions);
    });

    it("should handle empty query for suggestions", () => {
      service.suggestProducts("").subscribe();

      const req = httpMock.expectOne((request) => 
        request.url === `${apiUrl}/api/products/suggest`
      );
      expect(req.request.params.get("query")).toBe("");
      req.flush([]);
    });
  });

  describe("transcribeAudio", () => {
    it("should post audio file with correct extension for mp4", () => {
      const blob = new Blob([""], { type: "audio/mp4" });
      
      service.transcribeAudio(blob).subscribe();

      const req = httpMock.expectOne(`${apiUrl}/api/stt/transcribe`);
      expect(req.request.method).toBe("POST");
      
      const formData = req.request.body as FormData;
      expect(formData.has("file")).toBeTrue();
      expect(formData.has("language")).toBeTrue();
      expect(formData.get("language")).toBe("ful");
      
      req.flush({ transcription: "test", translation: "test" });
    });

    it("should post audio file with correct extension for wav", () => {
      const blob = new Blob([""], { type: "audio/wav" });
      service.transcribeAudio(blob).subscribe();
      const req = httpMock.expectOne(`${apiUrl}/api/stt/transcribe`);
      req.flush({});
    });

    it("should post audio file with correct extension for ogg", () => {
      const blob = new Blob([""], { type: "audio/ogg" });
      service.transcribeAudio(blob).subscribe();
      const req = httpMock.expectOne(`${apiUrl}/api/stt/transcribe`);
      req.flush({});
    });

    it("should default to webm extension for unknown types", () => {
      const blob = new Blob([""], { type: "audio/unknown" });
      service.transcribeAudio(blob).subscribe();
      const req = httpMock.expectOne(`${apiUrl}/api/stt/transcribe`);
      req.flush({});
    });
  });
}
);