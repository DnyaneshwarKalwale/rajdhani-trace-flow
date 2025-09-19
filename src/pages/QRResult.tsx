import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Package, 
  Calendar, 
  MapPin, 
  User, 
  Star, 
  Ruler, 
  Weight, 
  Layers,
  QrCode,
  ArrowLeft,
  Download,
  Share,
  CheckCircle,
  Clock,
  Factory,
  Award,
  Eye,
  Smartphone
} from "lucide-react";
import { ProductService } from "@/services/ProductService";
import { individualProductService } from "@/services/individualProductService";

interface QRResultData {
  type: 'main' | 'individual';
  productId: string;
  individualProductId?: string;
}

export default function QRResult() {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [productData, setProductData] = useState<any>(null);
  const [individualProductData, setIndividualProductData] = useState<any>(null);

  useEffect(() => {
    const loadQRData = async () => {
      try {
        setLoading(true);
        
        // Get QR data from URL parameters
        const qrData = searchParams.get('data');
        if (!qrData) {
          setError('No QR code data found');
          return;
        }

        let parsedData: QRResultData;
        try {
          parsedData = JSON.parse(decodeURIComponent(qrData));
        } catch (parseError) {
          setError('Invalid QR code data format');
          return;
        }

        if (parsedData.type === 'main') {
          // Load main product data
          const { data: product, error: productError } = await ProductService.getProductById(parsedData.productId);
          if (productError) {
            setError(`Failed to load product: ${productError}`);
            return;
          }
          setProductData(product);
        } else if (parsedData.type === 'individual') {
          // Load individual product data
          const { data: individualProduct, error: individualError } = await individualProductService.getIndividualProductById(parsedData.individualProductId!);
          if (individualError) {
            setError(`Failed to load individual product: ${individualError}`);
            return;
          }
          setIndividualProductData(individualProduct);
          
          // Also load the main product data for context
          const { data: product, error: productError } = await ProductService.getProductById(parsedData.productId);
          if (!productError) {
            setProductData(product);
          }
        }

      } catch (err) {
        setError('Failed to load QR code data');
      } finally {
        setLoading(false);
      }
    };

    loadQRData();
  }, [searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Loading Product Details</h2>
          <p className="text-gray-600">Please wait while we fetch the information...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-pink-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Package className="w-10 h-10 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Error Loading Product</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button 
            onClick={() => window.location.href = '/'}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back Home
          </Button>
        </div>
      </div>
    );
  }

  const isIndividualProduct = !!individualProductData;
  const displayData = isIndividualProduct ? individualProductData : productData;

  if (!displayData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">No Data Found</h2>
          <p className="text-gray-600">Unable to load product information.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <QrCode className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Product Details</h1>
                <p className="text-sm text-gray-600">Scanned via QR Code</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm">
                <Share className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button 
                onClick={() => window.location.href = '/'}
                variant="outline" 
                size="sm"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Product Header */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <Package className="w-7 h-7" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold">{displayData.name || displayData.product_name}</h1>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge className="bg-white/20 text-white border-white/30">
                        {isIndividualProduct ? 'Individual Product' : 'Main Product'}
                      </Badge>
                      {displayData.quality_grade && (
                        <Badge className={`${
                          displayData.quality_grade === 'A+' ? 'bg-purple-100 text-purple-800' :
                          displayData.quality_grade === 'A' ? 'bg-green-100 text-green-800' :
                          displayData.quality_grade === 'B' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          <Award className="w-3 h-3 mr-1" />
                          Grade {displayData.quality_grade}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <p className="text-blue-100 text-lg">
                  {displayData.category} • {displayData.color || 'Standard Color'}
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button className="bg-white/20 hover:bg-white/30 text-white border-white/30">
                  <Eye className="w-4 h-4 mr-2" />
                  View Full Details
                </Button>
                <Button className="bg-white text-blue-600 hover:bg-gray-50">
                  <Smartphone className="w-4 h-4 mr-2" />
                  Mobile View
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Product Information Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Information */}
          <div className="lg:col-span-2 space-y-8">
            {/* Basic Information */}
            <Card className="border-0 shadow-lg">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Package className="w-5 h-5 text-blue-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Basic Information</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-3 border-b border-gray-100">
                      <span className="text-gray-600 font-medium">Product ID</span>
                      <span className="font-mono text-sm bg-gray-100 px-3 py-1 rounded-lg">{displayData.id}</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-gray-100">
                      <span className="text-gray-600 font-medium">Category</span>
                      <span className="font-semibold">{displayData.category}</span>
                    </div>
                    {displayData.color && (
                      <div className="flex justify-between items-center py-3 border-b border-gray-100">
                        <span className="text-gray-600 font-medium">Color</span>
                        <span className="font-semibold">{displayData.color}</span>
                      </div>
                    )}
                    {displayData.pattern && (
                      <div className="flex justify-between items-center py-3 border-b border-gray-100">
                        <span className="text-gray-600 font-medium">Pattern</span>
                        <span className="font-semibold">{displayData.pattern}</span>
                      </div>
                    )}
                  </div>
                  <div className="space-y-4">
                    {displayData.size && (
                      <div className="flex justify-between items-center py-3 border-b border-gray-100">
                        <span className="text-gray-600 font-medium">Size</span>
                        <span className="font-semibold">{displayData.size}</span>
                      </div>
                    )}
                    {displayData.location && (
                      <div className="flex justify-between items-center py-3 border-b border-gray-100">
                        <span className="text-gray-600 font-medium">Location</span>
                        <span className="font-semibold flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          {displayData.location}
                        </span>
                      </div>
                    )}
                    {displayData.status && (
                      <div className="flex justify-between items-center py-3 border-b border-gray-100">
                        <span className="text-gray-600 font-medium">Status</span>
                        <Badge className={`${
                          displayData.status === 'available' ? 'bg-green-100 text-green-800' :
                          displayData.status === 'sold' ? 'bg-blue-100 text-blue-800' :
                          displayData.status === 'damaged' ? 'bg-red-100 text-red-800' :
                          displayData.status === 'reserved' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {displayData.status}
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Specifications */}
            <Card className="border-0 shadow-lg">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                    <Ruler className="w-5 h-5 text-green-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Specifications</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    {displayData.final_dimensions && (
                      <div className="flex justify-between items-center py-3 border-b border-gray-100">
                        <span className="text-gray-600 font-medium">Dimensions</span>
                        <span className="font-semibold">{displayData.final_dimensions}</span>
                      </div>
                    )}
                    {displayData.final_weight && (
                      <div className="flex justify-between items-center py-3 border-b border-gray-100">
                        <span className="text-gray-600 font-medium">Weight</span>
                        <span className="font-semibold flex items-center gap-2">
                          <Weight className="w-4 h-4" />
                          {displayData.final_weight}
                        </span>
                      </div>
                    )}
                    {displayData.final_thickness && (
                      <div className="flex justify-between items-center py-3 border-b border-gray-100">
                        <span className="text-gray-600 font-medium">Thickness</span>
                        <span className="font-semibold">{displayData.final_thickness}</span>
                      </div>
                    )}
                  </div>
                  <div className="space-y-4">
                    {displayData.width && (
                      <div className="flex justify-between items-center py-3 border-b border-gray-100">
                        <span className="text-gray-600 font-medium">Width</span>
                        <span className="font-semibold">{displayData.width}</span>
                      </div>
                    )}
                    {displayData.height && (
                      <div className="flex justify-between items-center py-3 border-b border-gray-100">
                        <span className="text-gray-600 font-medium">Height</span>
                        <span className="font-semibold">{displayData.height}</span>
                      </div>
                    )}
                    {displayData.pile_height && (
                      <div className="flex justify-between items-center py-3 border-b border-gray-100">
                        <span className="text-gray-600 font-medium">Pile Height</span>
                        <span className="font-semibold">{displayData.pile_height}</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* QR Code */}
            <Card className="border-0 shadow-lg">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                    <QrCode className="w-5 h-5 text-purple-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">QR Code</h2>
                </div>
                <div className="text-center">
                  <div className="bg-white p-6 rounded-xl border-2 border-gray-200 mb-4">
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(JSON.stringify({
                        type: isIndividualProduct ? 'individual' : 'main',
                        productId: displayData.product_id || displayData.id,
                        individualProductId: isIndividualProduct ? displayData.id : undefined
                      }))}`}
                      alt={`QR Code for ${displayData.name || displayData.product_name}`}
                      className="w-48 h-48 mx-auto"
                    />
                  </div>
                  <p className="text-sm text-gray-600">
                    Scan this QR code to access product information
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Production Information */}
            <Card className="border-0 shadow-lg">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                    <Factory className="w-5 h-5 text-orange-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Production Info</h2>
                </div>
                <div className="space-y-4">
                  {displayData.qr_code && (
                    <div className="flex justify-between items-center py-3 border-b border-gray-100">
                      <span className="text-gray-600 font-medium">QR Code ID</span>
                      <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">{displayData.qr_code}</span>
                    </div>
                  )}
                  {displayData.production_date && (
                    <div className="flex justify-between items-center py-3 border-b border-gray-100">
                      <span className="text-gray-600 font-medium">Production Date</span>
                      <span className="font-semibold flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {new Date(displayData.production_date).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  {displayData.completion_date && (
                    <div className="flex justify-between items-center py-3 border-b border-gray-100">
                      <span className="text-gray-600 font-medium">Completion Date</span>
                      <span className="font-semibold flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        {new Date(displayData.completion_date).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  {displayData.added_date && (
                    <div className="flex justify-between items-center py-3 border-b border-gray-100">
                      <span className="text-gray-600 font-medium">Added to Inventory</span>
                      <span className="font-semibold flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        {new Date(displayData.added_date).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  {displayData.inspector && (
                    <div className="flex justify-between items-center py-3 border-b border-gray-100">
                      <span className="text-gray-600 font-medium">Inspector</span>
                      <span className="font-semibold flex items-center gap-2">
                        <User className="w-4 h-4" />
                        {displayData.inspector}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quality Information */}
            {displayData.quality_grade && (
              <Card className="border-0 shadow-lg">
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
                      <Award className="w-5 h-5 text-yellow-600" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">Quality</h2>
                  </div>
                  <div className="text-center">
                    <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${
                      displayData.quality_grade === 'A+' ? 'bg-purple-100' :
                      displayData.quality_grade === 'A' ? 'bg-green-100' :
                      displayData.quality_grade === 'B' ? 'bg-yellow-100' :
                      'bg-gray-100'
                    }`}>
                      <span className={`text-3xl font-bold ${
                        displayData.quality_grade === 'A+' ? 'text-purple-600' :
                        displayData.quality_grade === 'A' ? 'text-green-600' :
                        displayData.quality_grade === 'B' ? 'text-yellow-600' :
                        'text-gray-600'
                      }`}>
                        {displayData.quality_grade}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Quality Grade: {displayData.quality_grade}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-gray-200">
            <div className="flex items-center justify-center gap-2 mb-4">
              <QrCode className="w-6 h-6 text-blue-600" />
              <h3 className="text-xl font-bold text-gray-900">Rajdhani Trace System</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Complete product traceability and quality management system
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Download Report
              </Button>
              <Button variant="outline">
                <Share className="w-4 h-4 mr-2" />
                Share Product
              </Button>
              <Button 
                onClick={() => window.location.href = '/'}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}