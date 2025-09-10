import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ModelCardList } from '@/components/model-cards/ModelCardList';
import { ModelCard } from '@/types/model-card';

// Mock the next/link component
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

const mockModelCards: ModelCard[] = [
  {
    id: '1',
    name: 'Test Model 1',
    version: '1.0.0',
    description: 'This is a test model for unit testing',
    domain: 'healthcare',
    risk_tier: 'medium',
    status: 'approved',
    fairness_score: 0.85,
    organization_id: 'org1',
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
    contact_email: 'test@example.com',
    tags: ['healthcare', 'diagnosis'],
  },
  {
    id: '2',
    name: 'Test Model 2',
    version: '2.0.0',
    description: 'This is another test model for unit testing',
    domain: 'finance',
    risk_tier: 'high',
    status: 'pending_review',
    fairness_score: 0.72,
    organization_id: 'org2',
    created_at: '2023-01-02T00:00:00Z',
    updated_at: '2023-01-02T00:00:00Z',
    documentation_url: 'https://example.com/docs',
  },
];

describe('ModelCardList', () => {
  it('renders loading state', () => {
    render(
      <ModelCardList
        modelCards={[]}
        loading={true}
        error={null}
        total={0}
        page={1}
        size={12}
        onPageChange={jest.fn()}
      />
    );

    expect(screen.getByText('Loading model cards...')).toBeInTheDocument();
  });

  it('renders error state', () => {
    render(
      <ModelCardList
        modelCards={[]}
        loading={false}
        error="Failed to load model cards"
        total={0}
        page={1}
        size={12}
        onPageChange={jest.fn()}
      />
    );

    expect(screen.getByText('Failed to load model cards')).toBeInTheDocument();
  });

  it('renders empty state', () => {
    render(
      <ModelCardList
        modelCards={[]}
        loading={false}
        error={null}
        total={0}
        page={1}
        size={12}
        onPageChange={jest.fn()}
      />
    );

    expect(screen.getByText('No model cards found')).toBeInTheDocument();
  });

  it('renders model cards', () => {
    render(
      <ModelCardList
        modelCards={mockModelCards}
        loading={false}
        error={null}
        total={2}
        page={1}
        size={12}
        onPageChange={jest.fn()}
      />
    );

    expect(screen.getByText('Test Model 1')).toBeInTheDocument();
    expect(screen.getByText('Test Model 2')).toBeInTheDocument();
    expect(screen.getByText('Healthcare')).toBeInTheDocument();
    expect(screen.getByText('Finance')).toBeInTheDocument();
    expect(screen.getByText('Medium Risk')).toBeInTheDocument();
    expect(screen.getByText('High Risk')).toBeInTheDocument();
    expect(screen.getByText('Approved')).toBeInTheDocument();
    expect(screen.getByText('Pending Review')).toBeInTheDocument();
  });

  it('renders pagination when total items exceed page size', () => {
    const onPageChange = jest.fn();
    
    render(
      <ModelCardList
        modelCards={mockModelCards}
        loading={false}
        error={null}
        total={25}
        page={1}
        size={12}
        onPageChange={onPageChange}
      />
    );

    expect(screen.getByText('Page 1 of 3')).toBeInTheDocument();
    expect(screen.getByText('Next')).toBeInTheDocument();
  });

  it('calls onPageChange when pagination buttons are clicked', async () => {
    const onPageChange = jest.fn();
    
    render(
      <ModelCardList
        modelCards={mockModelCards}
        loading={false}
        error={null}
        total={25}
        page={1}
        size={12}
        onPageChange={onPageChange}
      />
    );

    fireEvent.click(screen.getByText('Next'));
    await waitFor(() => {
      expect(onPageChange).toHaveBeenCalledWith(2);
    });
  });

  it('disables pagination buttons when on first or last page', () => {
    const onPageChange = jest.fn();
    
    render(
      <ModelCardList
        modelCards={mockModelCards}
        loading={false}
        error={null}
        total={24}
        page={1}
        size={12}
        onPageChange={onPageChange}
      />
    );

    expect(screen.getByText('Previous')).toHaveClass('text-gray-300');
    expect(screen.getByText('Next')).not.toHaveClass('text-gray-300');
  });

  it('displays fairness score correctly', () => {
    render(
      <ModelCardList
        modelCards={mockModelCards}
        loading={false}
        error={null}
        total={2}
        page={1}
        size={12}
        onPageChange={jest.fn()}
      />
    );

    expect(screen.getByText('85.0%')).toBeInTheDocument();
    expect(screen.getByText('72.0%')).toBeInTheDocument();
  });

  it('displays "Not assessed" when fairness score is missing', () => {
    const modelCardsWithoutFairnessScore = [
      {
        ...mockModelCards[0],
        fairness_score: undefined,
      },
    ];

    render(
      <ModelCardList
        modelCards={modelCardsWithoutFairnessScore}
        loading={false}
        error={null}
        total={1}
        page={1}
        size={12}
        onPageChange={jest.fn()}
      />
    );

    expect(screen.getByText('Not assessed')).toBeInTheDocument();
  });

  it('applies correct color classes to fairness scores', () => {
    render(
      <ModelCardList
        modelCards={mockModelCards}
        loading={false}
        error={null}
        total={2}
        page={1}
        size={12}
        onPageChange={jest.fn()}
      />
    );

    const highScore = screen.getByText('85.0%');
    const mediumScore = screen.getByText('72.0%');
    
    expect(highScore).toHaveClass('text-green-600');
    expect(mediumScore).toHaveClass('text-yellow-600');
  });
});