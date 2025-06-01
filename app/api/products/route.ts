import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: { name: 'asc' }
    })
    return NextResponse.json(products)
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch products',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('Creating product with data:', body)
    
    // Validate required fields
    if (!body.name || !body.received_state || !body.portion_unit) {
      return NextResponse.json({ 
        error: 'Missing required fields',
        details: 'name, received_state, and portion_unit are required'
      }, { status: 400 })
    }
    
    const product = await prisma.product.create({
      data: {
        name: body.name,
        received_state: body.received_state,
        portion_size: parseFloat(body.portion_size) || 0,
        portion_unit: body.portion_unit,
        shelf_life_fresh: parseInt(body.shelf_life_fresh) || 0,
        shelf_life_thawed: parseInt(body.shelf_life_thawed) || 0,
        track_by_unit: Boolean(body.track_by_unit)
      }
    })
    
    console.log('Product created successfully:', product)
    return NextResponse.json(product)
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json({ 
      error: 'Failed to create product',
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const product = await prisma.product.update({
      where: { id: body.id },
      data: {
        name: body.name,
        received_state: body.received_state,
        portion_size: parseFloat(body.portion_size),
        portion_unit: body.portion_unit,
        shelf_life_fresh: parseInt(body.shelf_life_fresh),
        shelf_life_thawed: parseInt(body.shelf_life_thawed),
        track_by_unit: Boolean(body.track_by_unit)
      }
    })
    return NextResponse.json(product)
  } catch (error) {
    console.error('Error updating product:', error)
    return NextResponse.json({ 
      error: 'Failed to update product',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}