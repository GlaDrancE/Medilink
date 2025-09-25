import React, { useState } from 'react';
import { Patient, Document } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    FileText,
    Download,
    Eye,
    Calendar,
    Filter,
    Search,
    Image as ImageIcon,
    FileImage,
    FileCheck,
    Stethoscope,
    TestTube
} from 'lucide-react';
import Input from '@/components/ui/input';

interface PatientReportsProps {
    patient: Patient;
}

const PatientReports: React.FC<PatientReportsProps> = ({ patient }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedType, setSelectedType] = useState<string>('all');
    const [sortBy, setSortBy] = useState<'date' | 'type' | 'name'>('date');

    // Get documents from patient data
    const documents = patient.documents || [];

    // Filter documents based on search and type
    const filteredDocuments = documents.filter(doc => {
        const matchesSearch = !searchTerm || 
            (doc.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
             doc.type.toLowerCase().includes(searchTerm.toLowerCase()));
        
        const matchesType = selectedType === 'all' || doc.type === selectedType;
        
        return matchesSearch && matchesType;
    });

    // Sort documents
    const sortedDocuments = [...filteredDocuments].sort((a, b) => {
        switch (sortBy) {
            case 'date':
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            case 'type':
                return a.type.localeCompare(b.type);
            case 'name':
                return (a.name || '').localeCompare(b.name || '');
            default:
                return 0;
        }
    });

    // Get unique document types for filter
    const documentTypes = ['all', ...Array.from(new Set(documents.map(doc => doc.type)))];

    // Format date
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Get document type icon and color
    const getDocumentTypeInfo = (type: string) => {
        switch (type.toLowerCase()) {
            case 'prescription':
                return { icon: FileText, color: 'bg-green-100 text-green-700', bgColor: 'bg-green-50' };
            case 'lab_test':
            case 'test':
                return { icon: TestTube, color: 'bg-blue-100 text-blue-700', bgColor: 'bg-blue-50' };
            case 'diagnosis':
                return { icon: Stethoscope, color: 'bg-red-100 text-red-700', bgColor: 'bg-red-50' };
            case 'report':
                return { icon: FileCheck, color: 'bg-purple-100 text-purple-700', bgColor: 'bg-purple-50' };
            default:
                return { icon: FileImage, color: 'bg-gray-100 text-gray-700', bgColor: 'bg-gray-50' };
        }
    };

    // Check if file is an image
    const isImageFile = (url: string) => {
        return /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(url);
    };

    // Handle document view
    const handleViewDocument = (document: Document) => {
        window.open(document.file_url, '_blank');
    };

    // Handle document download
    const handleDownloadDocument = (doc: Document) => {
        const link = window.document.createElement('a');
        link.href = doc.file_url;
        link.download = doc.name || `document_${doc.id}`;
        link.target = '_blank';
        window.document.body.appendChild(link);
        link.click();
        window.document.body.removeChild(link);
    };

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800">Medical Reports</h2>
                <Badge variant="outline" className="text-sm">
                    {documents.length} {documents.length === 1 ? 'Document' : 'Documents'}
                </Badge>
            </div>

            {/* Search and Filter Bar */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3">
                        {/* Search */}
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <Input
                                placeholder="Search documents..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>

                        {/* Type Filter */}
                        <select
                            value={selectedType}
                            onChange={(e) => setSelectedType(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {documentTypes.map(type => (
                                <option key={type} value={type}>
                                    {type === 'all' ? 'All Types' : type.charAt(0).toUpperCase() + type.slice(1)}
                                </option>
                            ))}
                        </select>

                        {/* Sort By */}
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as 'date' | 'type' | 'name')}
                            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="date">Sort by Date</option>
                            <option value="type">Sort by Type</option>
                            <option value="name">Sort by Name</option>
                        </select>
                    </div>
                </CardContent>
            </Card>

            {/* Documents List */}
            {sortedDocuments.length === 0 ? (
                <Card>
                    <CardContent className="p-8 text-center">
                        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-600 mb-2">No Documents Found</h3>
                        <p className="text-gray-500">
                            {searchTerm || selectedType !== 'all' 
                                ? 'Try adjusting your search or filter criteria.'
                                : 'Your medical documents will appear here once uploaded.'}
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-3">
                    {sortedDocuments.map((document, index) => {
                        const typeInfo = getDocumentTypeInfo(document.type);
                        const TypeIcon = typeInfo.icon;

                        return (
                            <Card key={document.id} className={`hover:shadow-md transition-shadow ${typeInfo.bgColor}`}>
                                <CardContent className="p-4">
                                    <div className="flex items-center space-x-4">
                                        {/* Document Icon */}
                                        <div className={`p-3 rounded-lg ${typeInfo.color}`}>
                                            <TypeIcon className="w-6 h-6" />
                                        </div>

                                        {/* Document Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center space-x-2 mb-1">
                                                <h3 className="font-semibold text-gray-800 truncate">
                                                    {document.name || `Document ${index + 1}`}
                                                </h3>
                                                <Badge variant="secondary" className="text-xs">
                                                    {document.type}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center text-sm text-gray-500 space-x-4">
                                                <div className="flex items-center space-x-1">
                                                    <Calendar className="w-4 h-4" />
                                                    <span>{formatDate(document.createdAt)}</span>
                                                </div>
                                                {isImageFile(document.file_url) && (
                                                    <div className="flex items-center space-x-1">
                                                        <ImageIcon className="w-4 h-4" />
                                                        <span>Image</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex space-x-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleViewDocument(document)}
                                                className="flex items-center space-x-1"
                                            >
                                                <Eye className="w-4 h-4" />
                                                <span className="hidden sm:inline">View</span>
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleDownloadDocument(document)}
                                                className="flex items-center space-x-1"
                                            >
                                                <Download className="w-4 h-4" />
                                                <span className="hidden sm:inline">Download</span>
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}

            {/* Summary Statistics */}
            {documents.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Document Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            {documentTypes.filter(type => type !== 'all').map(type => {
                                const count = documents.filter(doc => doc.type === type).length;
                                const typeInfo = getDocumentTypeInfo(type);
                                const TypeIcon = typeInfo.icon;
                                
                                return (
                                    <div key={type} className="text-center">
                                        <div className={`inline-flex p-2 rounded-lg ${typeInfo.color} mb-2`}>
                                            <TypeIcon className="w-5 h-5" />
                                        </div>
                                        <div className="text-2xl font-bold text-gray-800">{count}</div>
                                        <div className="text-sm text-gray-600 capitalize">{type}</div>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default PatientReports;