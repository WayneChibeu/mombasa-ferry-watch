
import FerryStatus from '@/components/FerryStatus';
import FerryArrivals from '@/components/FerryArrivals';
import ReportForm from '@/components/ReportForm';
import SMSTestPanel from '@/components/SMSTestPanel';
import Announcements from '@/components/Announcements';

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            FerryGo
          </h1>
          <p className="text-gray-600">
            Real-time Mombasa ferry status updates
          </p>
        </header>

        {/* Announcements Section */}
        <div className="max-w-4xl mx-auto mb-8">
          <Announcements />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto mb-8">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Ferry Arrivals
            </h2>
            <FerryArrivals />
          </div>
          
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Submit Report
            </h2>
            <ReportForm />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto mb-8">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Current Status
            </h2>
            <FerryStatus />
          </div>
          
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              AI Analysis Testing
            </h2>
            <SMSTestPanel />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
