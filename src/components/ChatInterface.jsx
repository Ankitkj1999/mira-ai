import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Send, Bot, User, Loader2, SlidersHorizontal, MessageSquare, ChevronDown, ChevronUp } from 'lucide-react';
import { chatAPI, propertiesAPI } from '../services/api';
import PropertyCard from './PropertyCard';

const ChatInterface = ({ selectedForComparison, onCompareToggle, messages, setMessages }) => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchMode, setSearchMode] = useState('ai'); // 'ai' or 'filter'
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [filterCriteria, setFilterCriteria] = useState({
    keyword: '',
    minPrice: '',
    maxPrice: '',
    bedrooms: '',
    minBedrooms: true,
    bathrooms: '',
    minBathrooms: true,
    location: '',
    property_type: '',
  });
  const [filterMetadata, setFilterMetadata] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch filter metadata on mount
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const response = await propertiesAPI.getFilterMetadata();
        setFilterMetadata(response.data);
      } catch (error) {
        console.error('Failed to fetch filter metadata:', error);
      }
    };
    fetchMetadata();
  }, []);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');

    // Add user message
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await chatAPI.sendMessage(userMessage);

      // Add AI response
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: response.data.response,
          properties: response.data.properties,
        },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again.',
          error: true,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFilterChange = (field, value) => {
    setFilterCriteria((prev) => ({ ...prev, [field]: value }));
  };

  const handleFilterSubmit = async () => {
    if (isLoading) return;

    // Clean filter criteria - remove empty values
    const cleanedFilters = {};
    if (filterCriteria.keyword?.trim()) cleanedFilters.keyword = filterCriteria.keyword.trim();
    if (filterCriteria.minPrice) cleanedFilters.minPrice = Number(filterCriteria.minPrice);
    if (filterCriteria.maxPrice) cleanedFilters.maxPrice = Number(filterCriteria.maxPrice);
    if (filterCriteria.bedrooms) {
      cleanedFilters.bedrooms = Number(filterCriteria.bedrooms);
      cleanedFilters.minBedrooms = filterCriteria.minBedrooms;
    }
    if (filterCriteria.bathrooms) {
      cleanedFilters.bathrooms = Number(filterCriteria.bathrooms);
      cleanedFilters.minBathrooms = filterCriteria.minBathrooms;
    }
    if (filterCriteria.location?.trim()) cleanedFilters.location = filterCriteria.location.trim();
    if (filterCriteria.property_type) cleanedFilters.property_type = filterCriteria.property_type;

    setIsLoading(true);

    try {
      const response = await chatAPI.filterProperties(cleanedFilters);

      // Format filter summary
      const filterSummary = [];
      if (cleanedFilters.minPrice || cleanedFilters.maxPrice) {
        const priceRange = `Price: ${cleanedFilters.minPrice ? `$${cleanedFilters.minPrice.toLocaleString()}` : 'Any'} - ${cleanedFilters.maxPrice ? `$${cleanedFilters.maxPrice.toLocaleString()}` : 'Any'}`;
        filterSummary.push(priceRange);
      }
      if (cleanedFilters.bedrooms) {
        filterSummary.push(`${cleanedFilters.minBedrooms ? '' : 'Exactly '}${cleanedFilters.bedrooms}${cleanedFilters.minBedrooms ? '+' : ''} bedroom${cleanedFilters.bedrooms > 1 ? 's' : ''}`);
      }
      if (cleanedFilters.bathrooms) {
        filterSummary.push(`${cleanedFilters.minBathrooms ? '' : 'Exactly '}${cleanedFilters.bathrooms}${cleanedFilters.minBathrooms ? '+' : ''} bathroom${cleanedFilters.bathrooms > 1 ? 's' : ''}`);
      }
      if (cleanedFilters.location) filterSummary.push(`Location: ${cleanedFilters.location}`);
      if (cleanedFilters.property_type) filterSummary.push(`Type: ${cleanedFilters.property_type}`);
      if (cleanedFilters.keyword) filterSummary.push(`Keyword: "${cleanedFilters.keyword}"`);

      const hasFilters = Object.keys(cleanedFilters).length > 0;
      const summaryText =
        response.count > 0
          ? hasFilters
            ? `Found ${response.count} propert${response.count === 1 ? 'y' : 'ies'} matching your criteria:\n${filterSummary.map((s) => `- ${s}`).join('\n')}`
            : `Showing all ${response.count} available properties.`
          : hasFilters
            ? 'No properties found matching your criteria. Try adjusting your filters.'
            : 'No properties available at the moment.';

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: summaryText,
          properties: response.data,
          source: 'filter',
        },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I encountered an error while filtering properties. Please try again.',
          error: true,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearFilters = () => {
    setFilterCriteria({
      keyword: '',
      minPrice: '',
      maxPrice: '',
      bedrooms: '',
      minBedrooms: true,
      bathrooms: '',
      minBathrooms: true,
      location: '',
      property_type: '',
    });
  };

  return (
    <div className="h-full flex flex-col relative">
      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-4xl mx-auto space-y-6 pb-80">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.role === 'assistant' && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center self-start">
                  <Bot className="w-4 h-4 text-primary-foreground" />
                </div>
              )}

              <div className={message.role === 'user' ? 'max-w-[85%]' : 'flex-1 max-w-[90%]'}>
                <div
                  className={`rounded-2xl px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground rounded-tr-none'
                      : message.error
                        ? 'bg-destructive/10 text-destructive border border-destructive/20 rounded-tl-none'
                        : 'bg-muted rounded-tl-none'
                  }`}
                >
                  {message.role === 'assistant' ? (
                    <div className="text-sm prose prose-sm max-w-none">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                          ul: ({ children }) => <ul className="mb-2 ml-4 list-disc">{children}</ul>,
                          ol: ({ children }) => <ol className="mb-2 ml-4 list-decimal">{children}</ol>,
                          li: ({ children }) => <li className="mb-1">{children}</li>,
                          strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                          h1: ({ children }) => <h1 className="text-lg font-bold mb-2">{children}</h1>,
                          h2: ({ children }) => <h2 className="text-base font-bold mb-2 mt-3">{children}</h2>,
                          h3: ({ children }) => <h3 className="text-sm font-bold mb-1 mt-2">{children}</h3>,
                        }}
                      >
                        {message.content}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                  )}
                </div>
                {message.properties && message.properties.length > 0 && (
                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {message.properties.map((property) => (
                      <PropertyCard
                        key={property.id}
                        property={property}
                        onCompareToggle={onCompareToggle}
                        isSelected={selectedForComparison.includes(property.id)}
                      />
                    ))}
                  </div>
                )}
              </div>

              {message.role === 'user' && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary flex items-center justify-center self-start">
                  <User className="w-4 h-4 text-secondary-foreground" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <Bot className="w-4 h-4 text-primary-foreground" />
              </div>
              <div className="bg-muted rounded-2xl rounded-tl-none px-4 py-3">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Fixed Input Area */}
      <div className="fixed bottom-0 left-0 right-0 pb-4 pt-2">
        <div className="max-w-4xl mx-auto px-4">
          <div className="rounded-3xl shadow-xl border border-border" style={{ backgroundColor: '#ffffff' }}>
            <div className="px-4 py-3">
          {/* Mode Toggle */}
          <div className="flex gap-2 mb-2">
            <button
              onClick={() => setSearchMode('ai')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                searchMode === 'ai'
                  ? 'bg-primary/10 text-primary border border-primary/20'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              AI Chat
            </button>
            <button
              onClick={() => setSearchMode('filter')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                searchMode === 'filter'
                  ? 'bg-primary/10 text-primary border border-primary/20'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filter
            </button>
          </div>

          {/* Filter Panel */}
          {searchMode === 'filter' && (
            <div className="mb-2 space-y-2">
              {/* Compact Main Filters */}
              <div className="p-3 border border-border rounded-xl shadow-lg space-y-2" style={{ backgroundColor: '#ffffff' }}>
                {/* Row 1: Location & Price Range */}
                <div className="grid grid-cols-3 gap-2">
                  <Select
                    value={filterCriteria.location}
                    onChange={(e) => handleFilterChange('location', e.target.value)}
                    className="h-9 text-sm"
                  >
                    <option value="">Location</option>
                    {filterMetadata?.locations.map((loc) => (
                      <option key={loc} value={loc}>
                        {loc}
                      </option>
                    ))}
                  </Select>
                  <Input
                    type="number"
                    placeholder="Min Price"
                    value={filterCriteria.minPrice}
                    onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                    className="h-9 text-sm"
                  />
                  <Input
                    type="number"
                    placeholder="Max Price"
                    value={filterCriteria.maxPrice}
                    onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                    className="h-9 text-sm"
                  />
                </div>

                {/* Row 2: Bedrooms & Bathrooms */}
                <div className="grid grid-cols-2 gap-2">
                  <Select
                    value={filterCriteria.bedrooms}
                    onChange={(e) => handleFilterChange('bedrooms', e.target.value)}
                    className="h-9 text-sm"
                  >
                    <option value="">Bedrooms</option>
                    {filterMetadata?.bedrooms.map((num) => (
                      <option key={num} value={num}>
                        {num}+ beds
                      </option>
                    ))}
                  </Select>
                  <Select
                    value={filterCriteria.bathrooms}
                    onChange={(e) => handleFilterChange('bathrooms', e.target.value)}
                    className="h-9 text-sm"
                  >
                    <option value="">Bathrooms</option>
                    {filterMetadata?.bathrooms.map((num) => (
                      <option key={num} value={num}>
                        {num}+ baths
                      </option>
                    ))}
                  </Select>
                </div>

                {/* Advanced Filters Toggle */}
                <button
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  className="flex items-center justify-center gap-1 w-full py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showAdvancedFilters ? (
                    <>
                      <ChevronUp className="w-3 h-3" />
                      Less filters
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-3 h-3" />
                      More filters
                    </>
                  )}
                </button>

                {/* Advanced Filters (Collapsible) */}
                {showAdvancedFilters && (
                  <div className="space-y-2 pt-2 border-t border-border/50">
                    <Input
                      placeholder="Search keywords..."
                      value={filterCriteria.keyword}
                      onChange={(e) => handleFilterChange('keyword', e.target.value)}
                      className="h-9 text-sm"
                    />
                    <Select
                      value={filterCriteria.property_type}
                      onChange={(e) => handleFilterChange('property_type', e.target.value)}
                      className="h-9 text-sm"
                    >
                      <option value="">Property Type</option>
                      {filterMetadata?.propertyTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </Select>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2 pt-1">
                  <Button
                    onClick={handleClearFilters}
                    variant="outline"
                    size="sm"
                    className="flex-1 h-9 text-sm"
                    disabled={isLoading}
                  >
                    Clear
                  </Button>
                  <Button
                    onClick={handleFilterSubmit}
                    variant="outline"
                    size="sm"
                    className="flex-1 h-9 text-sm"
                    disabled={isLoading}
                  >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Search'}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Chat Input (AI Mode) */}
          {searchMode === 'ai' && (
            <>
              <div className="flex gap-2 border border-border rounded-3xl shadow-lg p-2" style={{ backgroundColor: '#ffffff' }}>
                <Textarea
                  placeholder="Describe your dream home..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={isLoading}
                  className="min-h-[52px] max-h-[120px] resize-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent"
                  rows={1}
                />
                <Button
                  onClick={handleSend}
                  disabled={isLoading || !input.trim()}
                  className="self-end h-[52px] w-[52px] rounded-full flex-shrink-0"
                  size="icon"
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                  <span className="sr-only">Send message</span>
                </Button>
              </div>
              <p className="text-xs text-center text-muted-foreground mt-1.5">
                Press Enter to send, Shift+Enter for new line
              </p>
            </>
          )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;